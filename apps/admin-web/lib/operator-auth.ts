import { createAdminClient } from "./admin-supabase";
import { normalizeRole } from "./roles";

export type Profile = {
  id: string; 
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

/**
 * Fetches the operator profile using a wildcard select to prevent
 * "column does not exist" errors caused by schema mismatches.
 */
export async function getOperatorProfileByAuthUserId(authUserId: string) {
  const supabase = createAdminClient();
  
  // 1. Fetching all columns (*) ensures the query won't crash if a column name changed
  const { data, error } = await supabase
    .from("profiles")
    .select("*") 
    .eq("id", authUserId) 
    .maybeSingle();

  if (error) {
    console.error("Database error fetching profile:", error);
    throw error;
  }

  if (!data) return null;

  // 2. Safe mapping: Handles different possible column names (e.g., fullname vs full_name)
  const profile: Profile = {
    id: data.id,
    role: data.role || "STAFF",
    app_role: data.app_role || data.role || "STAFF",
    full_name: data.full_name || data.fullname || "Operator",
    preferred_language: data.preferred_language || "en",
    primary_branch_id: data.primary_branch_id,
    primary_branch_code: data.primary_branch_code,
    must_change_password: Boolean(data.must_change_password),
    is_active: Boolean(data.is_active ?? true),
  };

  return profile;
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

export async function assertBranchAccess(
  profileId: string, 
  branchCode: string | null, 
  allowedRoles?: string[]
) {
  const memberships = await getBranchMemberships(profileId);
  if (memberships.length === 0) {
    return { ok: false as const, reason: "No branch memberships found.", memberships };
  }

  const normalized = branchCode?.trim().toUpperCase() ?? null;
  const match = normalized
    ? memberships.find((item) => item.branch_code.toUpperCase() === normalized)
    : memberships.find((item) => item.is_primary) ?? memberships[0];

  if (!match) {
    return { 
      ok: false as const, 
      reason: "Operator is not assigned to the requested branch.", 
      memberships 
    };
  }

  if (allowedRoles?.length && !allowedRoles.includes(match.role) && !allowedRoles.includes("any")) {
    return { 
      ok: false as const, 
      reason: "Operator does not have the required branch-scoped role.", 
      memberships 
    };
  }

  return {
    ok: true as const,
    membership: match,
    memberships
  };
}

export function getEffectiveOperatorRole(profile: Pick<Profile, "app_role" | "role">) {
  return normalizeRole(profile.app_role ?? profile.role ?? null) ?? "STAFF";
}