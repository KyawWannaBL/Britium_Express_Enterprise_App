
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/admin-supabase";
import { requireOpsAccess } from "../../../lib/api-guard";

export async function GET(request: NextRequest) {
  const access = await requireOpsAccess(request);
  if (access instanceof NextResponse) {
    return access;
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.min(20, Number(request.nextUrl.searchParams.get("limit") ?? 8));

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("customers")
      .select("id, customer_code, customer_type, full_name, company_name, phone_e164, email, preferred_language, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (q) {
      query = query.or(`full_name.ilike.%${q}%,company_name.ilike.%${q}%,phone_e164.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data ?? [], limit, operator: access.profileId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to search customers" }, { status: 500 });
  }
}
