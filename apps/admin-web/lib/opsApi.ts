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

  throw new Error(`No POST candidate worked:\n${errors.join("\n")}`);
}

export const WAREHOUSE_ENDPOINTS = {
  scans: splitEnv("NEXT_PUBLIC_WAREHOUSE_SCAN_ENDPOINTS", [
    "/api/v1/warehouse/scans",
    "/api/warehouse/scans",
  ]),
  inboundReceipts: splitEnv("NEXT_PUBLIC_WAREHOUSE_INBOUND_ENDPOINTS", [
    "/api/v1/warehouse/inbound-receipts",
    "/api/warehouse/inbound-receipts",
  ]),
  bags: splitEnv("NEXT_PUBLIC_WAREHOUSE_BAG_ENDPOINTS", [
    "/api/v1/warehouse/bags",
    "/api/warehouse/bags",
  ]),
  manifests: splitEnv("NEXT_PUBLIC_WAREHOUSE_MANIFEST_ENDPOINTS", [
    "/api/v1/manifests",
    "/api/manifests",
  ]),
  manifestDispatch: splitEnv("NEXT_PUBLIC_WAREHOUSE_MANIFEST_DISPATCH_ENDPOINTS", [
    "/api/v1/manifests/{id}/dispatch",
    "/api/manifests/{id}/dispatch",
  ]),
};

export const RIDER_ENDPOINTS = {
  tasks: splitEnv("NEXT_PUBLIC_RIDER_TASK_ENDPOINTS", [
    "/api/v1/rider/tasks",
    "/api/rider/tasks",
    "/api/v1/delivery-tasks",
    "/api/delivery-tasks",
  ]),
  accept: splitEnv("NEXT_PUBLIC_RIDER_ACCEPT_ENDPOINTS", [
    "/api/v1/rider/tasks/{id}/accept",
    "/api/rider/tasks/{id}/accept",
  ]),
  start: splitEnv("NEXT_PUBLIC_RIDER_START_ENDPOINTS", [
    "/api/v1/rider/tasks/{id}/start",
    "/api/rider/tasks/{id}/start",
  ]),
  complete: splitEnv("NEXT_PUBLIC_RIDER_COMPLETE_ENDPOINTS", [
    "/api/v1/rider/tasks/{id}/complete",
    "/api/rider/tasks/{id}/complete",
  ]),
  attempts: splitEnv("NEXT_PUBLIC_RIDER_ATTEMPT_ENDPOINTS", [
    "/api/v1/rider/tasks/{id}/attempts",
    "/api/rider/tasks/{id}/attempts",
  ]),
  codCollections: splitEnv("NEXT_PUBLIC_RIDER_COD_ENDPOINTS", [
    "/api/v1/rider/cod-collections",
    "/api/rider/cod-collections",
  ]),
};

export function withId(candidates: string[], id: string) {
  return candidates.map((x) => fillId(x, id));
}
