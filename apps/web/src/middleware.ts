import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedPrefixes = [
  "/internal/rider-driver",
  "/internal/warehouse",
  "/internal/data-entry",
  "/internal/supervisor",
  "/internal/admin-hr",
] as const;

const portalRoleMap: Record<string, string[]> = {
  "/internal/rider-driver": ["rider","driver","pickup_rider","delivery_rider","return_runner","vehicle_driver"],
  "/internal/warehouse": ["warehouse_manager","receiving_clerk","sorting_staff","inventory_controller","dispatch_coordinator","qa_officer","returns_officer","scanner_operator","warehouse_admin"],
  "/internal/data-entry": ["data_entry_clerk","senior_data_entry_reviewer","data_entry_supervisor"],
  "/internal/supervisor": ["operations_supervisor","dispatch_supervisor","fleet_supervisor","planning_supervisor","branch_supervisor","senior_operations_manager"],
  "/internal/admin-hr": ["hr_officer","hr_manager","admin_officer","admin_manager","recruiter","payroll_benefits_coordinator","branch_admin","department_head","people_ops_lead","super_admin"],
};

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;
  const matchedPrefix = protectedPrefixes.find((prefix) => pathname.startsWith(prefix));
  if (!matchedPrefix) return NextResponse.next();
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  const allowedRoles = portalRoleMap[matchedPrefix] ?? [];
  const userRoles = session.user.roles ?? [];
  const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));
  if (!hasAllowedRole) return NextResponse.redirect(new URL("/unauthorized", req.url));
  return NextResponse.next();
});

export const config = { matcher: ["/internal/:path*"] };
