import { NextRequest, NextResponse } from "next/server";
import { requireOpsAccess } from "@/lib/api-guard";
import { canManageUsers, normalizeRole } from "@/lib/roles";
import {
  createOperatorAccount,
  ensureAssignable,
  listBranches,
  listOperators
} from "@/lib/operator-management";
import { createAdminClient } from "@/lib/admin-supabase";

export async function GET(request: NextRequest) {
  const identity = await requireOpsAccess(
    request,
    ["SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN", "HR_ADMIN"],
    ["any"]
  );

  if (identity instanceof NextResponse) return identity;
  if (!canManageUsers(identity.appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";

  try {
    const admin = createAdminClient();
    const [operators, branches] = await Promise.all([
      listOperators(),
      listBranches()
    ]);

    const filtered = q
      ? operators.filter((item) =>
          [item.full_name, item.email, item.phone_e164, item.role, item.app_role]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q.toLowerCase()))
        )
      : operators;

    return NextResponse.json({ operators: filtered, branches, identity, ok: true, adminReady: !!admin });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load operators." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const identity = await requireOpsAccess(
    request,
    ["SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN", "HR_ADMIN"],
    ["any"]
  );

  if (identity instanceof NextResponse) return identity;
  if (!canManageUsers(identity.appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const role = normalizeRole(body.role);

    if (!body.email || !body.fullName || !body.phone || !role) {
      return NextResponse.json(
        { error: "email, fullName, phone and role are required." },
        { status: 400 }
      );
    }

    if (!ensureAssignable(identity.appRole, role)) {
      return NextResponse.json(
        { error: `Role ${role} cannot be assigned by ${identity.appRole}.` },
        { status: 403 }
      );
    }

    let primaryBranchCode: string | null = null;
    if (body.primaryBranchId) {
      const branches = await listBranches();
      const branch = branches.find((b) => b.id === body.primaryBranchId);
      primaryBranchCode = branch?.code ?? null;
    }

    const operator = await createOperatorAccount({
      email: String(body.email).trim(),
      password: String(body.temporaryPassword || "P@ssw0rd1"),
      fullName: String(body.fullName).trim(),
      phone: String(body.phone).trim(),
      appRole: role,
      preferredLanguage: body.preferredLanguage === "my" ? "my" : "en",
      primaryBranchId: body.primaryBranchId || null,
      primaryBranchCode
    });

    const supabase = createAdminClient();
    await supabase.from("operator_admin_actions").insert({
      actor_profile_id: identity.profileId,
      target_profile_id: operator.id,
      action: "create_operator",
      metadata: {
        email: body.email,
        appRole: role,
        primaryBranchId: body.primaryBranchId || null,
        primaryBranchCode
      }
    });

    return NextResponse.json({ ok: true, operator });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create operator." },
      { status: 500 }
    );
  }
}
