import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function splitEnv(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(",").map((x) => x.trim()).filter(Boolean);
}

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

  if (json) headers.set("Content-Type", "application/json");

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
          const body = await res.json();
          message = body?.detail || body?.title || message;
        } catch {}
        errors.push(`${path} -> ${message}`);
        continue;
      }

      return (await res.json()) as T;
    } catch (err) {
      errors.push(`${path} -> ${err instanceof Error ? err.message : "network error"}`);
    }
  }

  throw new Error(errors.join("\n"));
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
          const body = await res.json();
          message = body?.detail || body?.title || message;
        } catch {}
        errors.push(`${req.path} -> ${message}`);
        continue;
      }

      if (res.status === 204) return {} as T;
      return (await res.json()) as T;
    } catch (err) {
      errors.push(`${req.path} -> ${err instanceof Error ? err.message : "network error"}`);
    }
  }

  throw new Error(errors.join("\n"));
}

export function withId(candidates: string[], id: string) {
  return candidates.map((x) => fillId(x, id));
}

export function getItems(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) return input as Record<string, unknown>[];
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
    if (Array.isArray(obj.shipments)) return obj.shipments as Record<string, unknown>[];
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
  }
  return [];
}

export function toText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "-";
}

export function toNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

export const WAY_ENDPOINTS = {
  list: splitEnv("NEXT_PUBLIC_WAY_LIST_ENDPOINTS", [
    "/api/v1/shipments",
    "/api/shipments",
    "/api/v1/way-management",
    "/api/way-management",
  ]),
};

export const SUPERVISOR_ENDPOINTS = {
  dashboard: splitEnv("NEXT_PUBLIC_SUPERVISOR_DASHBOARD_ENDPOINTS", [
    "/api/v1/supervisor/dashboard",
    "/api/supervisor/dashboard",
    "/api/v1/dashboard/supervisor",
  ]),
  approvals: splitEnv("NEXT_PUBLIC_SUPERVISOR_APPROVALS_ENDPOINTS", [
    "/api/v1/approvals/pending",
    "/api/approvals/pending",
    "/api/v1/supervisor/approvals",
  ]),
  incidents: splitEnv("NEXT_PUBLIC_SUPERVISOR_INCIDENTS_ENDPOINTS", [
    "/api/v1/incidents",
    "/api/incidents",
    "/api/v1/support/tickets",
  ]),
  staff: splitEnv("NEXT_PUBLIC_SUPERVISOR_STAFF_ENDPOINTS", [
    "/api/v1/staff/activity",
    "/api/staff/activity",
    "/api/v1/users",
  ]),
};

export const DATA_ENTRY_ENDPOINTS = {
  list: splitEnv("NEXT_PUBLIC_DATA_ENTRY_LIST_ENDPOINTS", [
    "/api/v1/shipments",
    "/api/shipments",
  ]),
  create: splitEnv("NEXT_PUBLIC_DATA_ENTRY_CREATE_ENDPOINTS", [
    "/api/v1/shipments",
    "/api/shipments",
    "/api/v1/merchant/shipments",
  ]),
};

export const PRINT_STUDIO_ENDPOINTS = {
  list: splitEnv("NEXT_PUBLIC_PRINT_LIST_ENDPOINTS", [
    "/api/v1/shipments",
    "/api/shipments",
    "/api/v1/waybills",
  ]),
  jobs: splitEnv("NEXT_PUBLIC_PRINT_JOB_ENDPOINTS", [
    "/api/v1/print-jobs",
    "/api/print-jobs",
  ]),
};
