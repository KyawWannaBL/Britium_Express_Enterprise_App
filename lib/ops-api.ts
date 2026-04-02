import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function envList(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(",").map((x) => x.trim()).filter(Boolean);
}

async function buildHeaders(json = false) {
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return headers;
}

export async function tryGetCandidates<T>(candidates: string[]): Promise<T> {
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
        let msg = `${res.status}`;
        try {
          const body = await res.json();
          msg = body?.detail || body?.title || msg;
        } catch {}
        errors.push(`${path} -> ${msg}`);
        continue;
      }

      return (await res.json()) as T;
    } catch (err) {
      errors.push(`${path} -> ${err instanceof Error ? err.message : "network error"}`);
    }
  }

  throw new Error(errors.join("\n"));
}

export async function tryPostCandidates<T>(
  candidates: string[],
  body: unknown
): Promise<T> {
  const headers = await buildHeaders(true);
  const errors: string[] = [];

  for (const path of candidates) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = `${res.status}`;
        try {
          const payload = await res.json();
          msg = payload?.detail || payload?.title || msg;
        } catch {}
        errors.push(`${path} -> ${msg}`);
        continue;
      }

      return (await res.json()) as T;
    } catch (err) {
      errors.push(`${path} -> ${err instanceof Error ? err.message : "network error"}`);
    }
  }

  throw new Error(errors.join("\n"));
}

export function getItems(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) return input as Record<string, unknown>[];
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (Array.isArray(obj.shipments)) return obj.shipments as Record<string, unknown>[];
    if (Array.isArray(obj.tasks)) return obj.tasks as Record<string, unknown>[];
    if (Array.isArray(obj.manifests)) return obj.manifests as Record<string, unknown>[];
    if (Array.isArray(obj.bags)) return obj.bags as Record<string, unknown>[];
    if (Array.isArray(obj.scans)) return obj.scans as Record<string, unknown>[];
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
      const parsed = Number(value.toString().replace(/,/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

export function formatMMK(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)} MMK`;
}

export function formatDate(value?: string | null): string {
  if (!value || value === "-") return "-";
  return value.replace("T", " ").replace("Z", "").slice(0, 16);
}
