import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/admin-supabase";
import { getOpsIdentity } from "../../../../lib/api-guard";

export async function POST(request: NextRequest) {
  const identity = await getOpsIdentity(request);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error: opError } = await supabase
    .from("operator_profiles")
    .update({
      must_change_password: false,
      password_changed_at: now,
      updated_at: now
    })
    .eq("id", identity.profileId);

  if (opError) {
    return NextResponse.json({ error: opError.message }, { status: 500 });
  }

  if (identity.legacyProfileId) {
    await supabase
      .from("profiles")
      .update({
        must_change_password: false,
        password_changed_at: now,
        updated_at: now
      })
      .eq("id", identity.legacyProfileId);
  }

  return NextResponse.json({
    ok: true,
    mustChangePassword: false,
    changedAt: now
  });
}
