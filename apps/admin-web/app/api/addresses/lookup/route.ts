
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/admin-supabase";
import { requireOpsAccess } from "../../../../lib/api-guard";

export async function GET(request: NextRequest) {
  const access = await requireOpsAccess(request);
  if (access instanceof NextResponse) {
    return access;
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  const city = (request.nextUrl.searchParams.get("city") ?? "").trim();
  const limit = Math.min(20, Number(request.nextUrl.searchParams.get("limit") ?? 10));

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("addresses")
      .select("id, label, contact_name, phone_e164, address_line_1, township, city, state_region, landmark, latitude, longitude, serviceable, validation_status")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (q) {
      query = query.or(`contact_name.ilike.%${q}%,address_line_1.ilike.%${q}%,township.ilike.%${q}%,phone_e164.ilike.%${q}%`);
    }

    if (city) {
      query = query.eq("city", city);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data ?? [], limit, operator: access.profileId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to search addresses" }, { status: 500 });
  }
}
