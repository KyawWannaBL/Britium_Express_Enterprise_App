import { createAdminClient } from "./admin-supabase";
import { normalizeRole } from "./roles";

export type OperatorProfile = {
  id: string;
  auth_user_id: string;
  profile_id: string | null;
  role: string;
  app_role: string | null;
  full_name: string;
  preferred_language: "en" | "my";
  primary_branch_id: string | null;
  primary_branch_code: string | null;
  must_change_password: boolean;
  is_active: boolean;
};

export type BranchMembership = {
  branch_id: string;
  branch_code: string;
  role: string;
  is_primary: boolean;
};

export async function getOperatorProfileByAuthUserId(authUserId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("operator_profiles")
    .select("id, auth_user_id, profile_id, role, app_role, full_name, preferred_language, primary_branch_id, primary_branch_code, must_change_password, is_active")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as OperatorProfile | null;
}

export async function getBranchMemberships(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("operator_branch_memberships")
    .select("branch_id, branch_code, role, is_primary")
    .eq("profile_id", profileId)
    .order("is_primary", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BranchMembership[];
}

export async function assertBranchAccess(profileId: string, branchCode: string | null, allowedRoles?: string[]) {
  const memberships = await getBranchMemberships(profileId);
  if (memberships.length === 0) {
    return { ok: false as const, reason: "No branch memberships found.", memberships };
  }

  const normalized = branchCode?.trim().toUpperCase() ?? null;
  const match = normalized
    ? memberships.find((item) => item.branch_code.toUpperCase() === normalized)
    : memberships.find((item) => item.is_primary) ?? memberships[0];

  if (!match) {
    return { ok: false as const, reason: "Operator is not assigned to the requested branch.", memberships };
  }

  if (allowedRoles?.length && !allowedRoles.includes(match.role) && !allowedRoles.includes("any")) {
    return { ok: false as const, reason: "Operator does not have the required branch-scoped role.", memberships };
  }

  return {
    ok: true as const,
    membership: match,
    memberships
  };
}

export function getEffectiveOperatorRole(profile: Pick<OperatorProfile, "app_role" | "role">) {
  return normalizeRole(profile.app_role ?? profile.role ?? null) ?? "STAFF";
}
