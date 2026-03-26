import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { assertBranchAccess, getEffectiveOperatorRole, getOperatorProfileByAuthUserId } from "./operator-auth";
import { checkPermission, normalizeRole } from "./roles";

export type OpsIdentity = {
  authUserId: string;
  profileId: string;
  legacyProfileId: string | null;
  role: string;
  appRole: string;
  fullName: string;
  branchCode: string | null;
  mustChangePassword: boolean;
  source: "supabase";
};

const DEFAULT_ALLOWED = [
  "admin",
  "dispatcher",
  "ops",
  "finance",
  "branch_manager",
  "OPERATIONS_ADMIN",
  "SUPER_ADMIN",
  "APP_OWNER",
  "SUPERVISOR",
  "SUBSTATION_MANAGER",
  "FINANCE_USER",
  "FINANCE_STAFF"
];

const DEFAULT_BRANCH_ROLES = ["any"];

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) throw new Error(`${name} is missing.`);
  return value;
}

function createRequestSupabaseClient(request: NextRequest) {
  return createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll(_cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {}
      }
    }
  );
}

export async function getOpsIdentity(request: NextRequest): Promise<OpsIdentity | null> {
  if (process.env.BRITIUM_DISABLE_AUTH === "1") {
    return {
      authUserId: "dev-admin",
      profileId: "dev-admin",
      legacyProfileId: "dev-admin",
      role: "admin",
      appRole: "SUPER_ADMIN",
      fullName: "Development Admin",
      branchCode: request.headers.get("x-britium-branch") ?? "YGN",
      mustChangePassword: false,
      source: "supabase"
    };
  }

  const supabase = createRequestSupabaseClient(request);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return null;
  }

  const profile = await getOperatorProfileByAuthUserId(authData.user.id);
  if (!profile || !profile.is_active) {
    return null;
  }

  const branchCode =
    request.headers.get("x-britium-branch") ??
    request.nextUrl.searchParams.get("branch") ??
    profile.primary_branch_code ??
    null;

  return {
    authUserId: authData.user.id,
    profileId: profile.id,
    legacyProfileId: profile.profile_id,
    role: profile.role,
    appRole: getEffectiveOperatorRole(profile),
    fullName: profile.full_name,
    branchCode,
    mustChangePassword: Boolean(profile.must_change_password),
    source: "supabase"
  };
}

function isAllowedByRole(identity: OpsIdentity, allowedRoles: string[]) {
  return allowedRoles.some((allowed) => {
    const normalizedAllowed = normalizeRole(allowed) ?? allowed;
    return (
      identity.role === allowed ||
      identity.appRole === allowed ||
      identity.appRole === normalizedAllowed ||
      identity.role.toUpperCase() === String(allowed).toUpperCase()
    );
  });
}

export async function requireOpsAccess(
  request: NextRequest,
  allowedRoles: string[] = DEFAULT_ALLOWED,
  allowedBranchRoles: string[] = DEFAULT_BRANCH_ROLES
): Promise<OpsIdentity | NextResponse> {
  const identity = await getOpsIdentity(request);

  if (!identity) {
    return NextResponse.json(
      {
        error: "Unauthorized. Sign in with a Supabase operator account.",
        signInPath: "/auth/sign-in"
      },
      { status: 401 }
    );
  }

  if (identity.mustChangePassword) {
    return NextResponse.json(
      {
        error: "Password change required before using operations routes.",
        redirectTo: "/auth/must-change-password"
      },
      { status: 403 }
    );
  }

  if (!isAllowedByRole(identity, allowedRoles)) {
    return NextResponse.json(
      {
        error: "Forbidden. You do not have the required operator role.",
        role: identity.role,
        appRole: identity.appRole
      },
      { status: 403 }
    );
  }

  const access = await assertBranchAccess(identity.profileId, identity.branchCode, allowedBranchRoles);
  if (!access.ok) {
    return NextResponse.json(
      {
        error: access.reason,
        memberships: access.memberships
      },
      { status: 403 }
    );
  }

  return identity;
}

export async function requirePermission(
  request: NextRequest,
  permission: string,
  allowedRoles: string[] = DEFAULT_ALLOWED,
  allowedBranchRoles: string[] = DEFAULT_BRANCH_ROLES
): Promise<OpsIdentity | NextResponse> {
  const identity = await requireOpsAccess(request, allowedRoles, allowedBranchRoles);
  if (identity instanceof NextResponse) return identity;

  if (!checkPermission(identity.appRole, permission)) {
    return NextResponse.json(
      {
        error: "Forbidden. Missing permission.",
        permission,
        appRole: identity.appRole
      },
      { status: 403 }
    );
  }

  return identity;
}
