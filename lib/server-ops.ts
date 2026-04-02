import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const admin = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function readFirstTable(
  candidates: string[],
  limit = 500
): Promise<{ table: string; rows: Record<string, unknown>[] }> {
  const errors: string[] = [];

  for (const table of candidates) {
    const { data, error } = await admin.from(table).select("*").limit(limit);
    if (!error) {
      return { table, rows: (data || []) as Record<string, unknown>[] };
    }
    errors.push(`${table} -> ${error.message}`);
  }

  throw new Error(errors.join("\n"));
}

export async function insertFirstTable(
  candidates: string[],
  payload: Record<string, unknown>
): Promise<{ table: string; row: Record<string, unknown> }> {
  const errors: string[] = [];

  for (const table of candidates) {
    const { data, error } = await admin.from(table).insert(payload).select("*").single();
    if (!error && data) {
      return { table, row: data as Record<string, unknown> };
    }
    errors.push(`${table} -> ${error?.message || "insert failed"}`);
  }

  throw new Error(errors.join("\n"));
}

export async function insertManyFirstTable(
  candidates: string[],
  payload: Record<string, unknown>[]
): Promise<{ table: string; rows: Record<string, unknown>[] }> {
  const errors: string[] = [];

  for (const table of candidates) {
    const { data, error } = await admin.from(table).insert(payload).select("*");
    if (!error) {
      return { table, rows: (data || []) as Record<string, unknown>[] };
    }
    errors.push(`${table} -> ${error.message}`);
  }

  throw new Error(errors.join("\n"));
}

export function txt(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function num(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/,/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}
