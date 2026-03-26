import { NextRequest, NextResponse } from "next/server";
import { requireOpsAccess } from "@/lib/api-guard";
import { canManageUsers } from "@/lib/roles";
import { listOperatorAuditLogs } from "@/lib/operator-management";

export async function GET(request: NextRequest) {
  const identity = await requireOpsAccess(
    request,
    ["SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN", "HR_ADMIN"],
    ["any"]
  );

  if (identity instanceof NextResponse) return identity;
  if (!canManageUsers(identity.appRole)) {
    return NextResponse.json({ error: "Not allowed to view operator audit logs." }, { status: 403 });
  }

  const operatorId = request.nextUrl.searchParams.get("operatorId");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100");

  try {
    const logs = await listOperatorAuditLogs(operatorId, Number.isFinite(limit) ? Math.min(limit, 200) : 100);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load audit logs." },
      { status: 500 }
    );
  }
}
