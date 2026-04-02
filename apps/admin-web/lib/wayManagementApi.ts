import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function splitEnv(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export const WAY_ENDPOINTS = {
  list: splitEnv("NEXT_PUBLIC_WAY_LIST_ENDPOINTS", [
    "/api/v1/shipments",
    "/api/shipments",
    "/api/v1/way-management",
    "/api/way-management",
  ]),
  timeline: splitEnv("NEXT_PUBLIC_WAY_TIMELINE_ENDPOINTS", [
    "/api/v1/shipments/{id}/timeline",
    "/api/shipments/{id}/timeline",
    "/api/v1/way-management/{id}/timeline",
    "/api/way-management/{id}/timeline",
  ]),
  pod: splitEnv("NEXT_PUBLIC_WAY_POD_ENDPOINTS", [
    "/api/v1/shipments/{id}/pod",
    "/api/shipments/{id}/pod",
    "/api/v1/way-management/{id}/pod",
    "/api/way-management/{id}/pod",
  ]),
  status: splitEnv("NEXT_PUBLIC_WAY_STATUS_ENDPOINTS", [
    "/api/v1/shipments/{id}/status",
    "/api/shipments/{id}/status",
    "/api/v1/way-management/{id}/status",
    "/api/way-management/{id}/status",
  ]),
  reassign: splitEnv("NEXT_PUBLIC_WAY_REASSIGN_ENDPOINTS", [
    "/api/v1/shipments/{id}/reassign-route",
    "/api/shipments/{id}/reassign-route",
    "/api/v1/way-management/{id}/reassign",
    "/api/way-management/{id}/reassign",
  ]),
  hold: splitEnv("NEXT_PUBLIC_WAY_HOLD_ENDPOINTS", [
    "/api/v1/shipments/{id}/hold",
    "/api/shipments/{id}/hold",
    "/api/v1/way-management/{id}/hold",
    "/api/way-management/{id}/hold",
  ]),
  returnToSender: splitEnv("NEXT_PUBLIC_WAY_RETURN_ENDPOINTS", [
    "/api/v1/shipments/{id}/return",
    "/api/shipments/{id}/return",
    "/api/v1/way-management/{id}/return",
    "/api/way-management/{id}/return",
  ]),
  supportTickets: splitEnv("NEXT_PUBLIC_WAY_SUPPORT_TICKET_ENDPOINTS", [
    "/api/v1/support/tickets",
    "/api/support/tickets",
    "/api/v1/tickets",
    "/api/tickets",
  ]),
};

function fillId(path: string, id: string) {
  return path.replaceAll("{id}", id);
}

async function buildHeaders(json = true, idempotency = false) {
  const supabase = createClient();
  const headers = new Headers();

  headers.set("Accept", "application/json");
  headers.set(
    "X-Request-Id",
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`
  );

  if (json) {
    headers.set("Content-Type", "application/json");
  }

  if (idempotency) {
    headers.set(
      "Idempotency-Key",
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-idem`
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return headers;
}

export async function tryGet<T>(candidates: string[]): Promise<T> {
  const headers = await buildHeaders(false);
  const errors: string[] = [];

  for (const path of candidates) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        let message = `${res.status}`;
        try {
          const problem = await res.json();
          message = problem?.detail || problem?.title || message;
        } catch {}
        errors.push(`${path} -> ${message}`);
        continue;
      }

      return (await res.json()) as T;
    } catch (err) {
      errors.push(`${path} -> ${err instanceof Error ? err.message : "network error"}`);
    }
  }

  throw new Error(`No GET candidate worked:\n${errors.join("\n")}`);
}

export async function tryPost<T>(
  requests: Array<{ path: string; body?: unknown; idempotency?: boolean }>
): Promise<T> {
  const errors: string[] = [];

  for (const req of requests) {
    try {
      const headers = await buildHeaders(true, Boolean(req.idempotency));
      const res = await fetch(`${API_BASE}${req.path}`, {
        method: "POST",
        headers,
        body: req.body ? JSON.stringify(req.body) : undefined,
      });

      if (!res.ok) {
        let message = `${res.status}`;
        try {
          const problem = await res.json();
          message = problem?.detail || problem?.title || message;
        } catch {}
        errors.push(`${req.path} -> ${message}`);
        continue;
      }

      if (res.status === 204) {
        return {} as T;
      }

      return (await res.json()) as T;
    } catch (err) {
      errors.push(`${req.path} -> ${err instanceof Error ? err.message : "network error"}`);
    }
  }

  throw new Error(`No POST candidate worked:\n${errors.join("\n")}`);
}

export function timelineCandidates(id: string) {
  return WAY_ENDPOINTS.timeline.map((x) => fillId(x, id));
}

export function podCandidates(id: string) {
  return WAY_ENDPOINTS.pod.map((x) => fillId(x, id));
}

export function statusRequests(
  id: string,
  payload: {
    event_code: string;
    to_status: string;
    reason_code?: string | null;
    notes?: string | null;
  }
) {
  return WAY_ENDPOINTS.status.map((x) => ({
    path: fillId(x, id),
    body: payload,
  }));
}

export function reassignRequests(
  id: string,
  payload: {
    to_branch_id?: string | null;
    notes?: string | null;
  }
) {
  return WAY_ENDPOINTS.reassign.map((x) => ({
    path: fillId(x, id),
    body: payload,
  }));
}

export function holdRequests(
  id: string,
  payload: {
    reason_code?: string | null;
    notes?: string | null;
  }
) {
  return [
    ...WAY_ENDPOINTS.hold.map((x) => ({
      path: fillId(x, id),
      body: payload,
    })),
    ...WAY_ENDPOINTS.status.map((x) => ({
      path: fillId(x, id),
      body: {
        event_code: "MANUAL_HOLD",
        to_status: "on_hold",
        reason_code: payload.reason_code || "MANUAL_HOLD",
        notes: payload.notes || null,
      },
    })),
  ];
}

export function returnRequests(
  id: string,
  payload: {
    reason_code?: string | null;
    notes?: string | null;
  }
) {
  return [
    ...WAY_ENDPOINTS.returnToSender.map((x) => ({
      path: fillId(x, id),
      body: payload,
    })),
    ...WAY_ENDPOINTS.status.map((x) => ({
      path: fillId(x, id),
      body: {
        event_code: "RETURN_TO_SENDER",
        to_status: "return_initiated",
        reason_code: payload.reason_code || "RETURN_TO_SENDER",
        notes: payload.notes || null,
      },
    })),
  ];
}

export function escalationRequests(payload: {
  shipment_id: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
}) {
  return WAY_ENDPOINTS.supportTickets.map((x) => ({
    path: x,
    body: payload,
    idempotency: true,
  }));
}
