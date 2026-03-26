
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export function buildRequestHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function getIdempotentResponse(
  supabase: SupabaseClient,
  routeKey: string,
  idempotencyKey: string,
  requestHash: string
) {
  const { data, error } = await supabase
    .from("api_idempotency")
    .select("status_code, response_json, request_hash")
    .eq("route_key", routeKey)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (data.request_hash !== requestHash) {
    throw new Error("Idempotency key reuse with different payload.");
  }

  return data;
}

export async function saveIdempotentResponse(
  supabase: SupabaseClient,
  routeKey: string,
  idempotencyKey: string,
  requestHash: string,
  statusCode: number,
  responseJson: unknown
) {
  const { error } = await supabase.from("api_idempotency").upsert(
    {
      route_key: routeKey,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      status_code: statusCode,
      response_json: responseJson,
      updated_at: new Date().toISOString()
    },
    { onConflict: "route_key,idempotency_key" }
  );

  if (error) {
    throw error;
  }
}
