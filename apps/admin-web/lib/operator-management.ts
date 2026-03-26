import { createAdminClient } from "./admin-supabase";
import { getAssignableAppRoles, mapAppRoleToBranchRole, normalizeRole } from "./roles";

export type OperatorListItem = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string | null;
  phone_e164: string | null;
  role: string;
  app_role: string | null;
  preferred_language: "en" | "my";
  primary_branch_id?: string | null;
  primary_branch_code: string | null;
  must_change_password: boolean;
  is_active: boolean;
  created_at?: string;
};

export type BranchOption = {
  id: string;
  code: string;
  name_en: string;
  name_my: string;
  city: string;
  township: string;
};

export type MembershipInput = {
  id?: string;
  branchId: string;
  branchCode: string;
  role: "admin" | "dispatcher" | "ops" | "finance" | "branch_manager";
  isPrimary: boolean;
};

export type OperatorAuditItem = {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_profile_id: string | null;
  target_profile_id: string | null;
  actor_name: string | null;
  target_name: string | null;
};

export async function listOperators() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("operator_profiles")
    .select("id, auth_user_id, full_name, role, app_role, preferred_language, primary_branch_id, primary_branch_code, must_change_password, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const profiles = (data ?? []) as OperatorListItem[];
  const { data: linkedProfiles } = await supabase
    .from("profiles")
    .select("id, email, phone_e164")
    .in("id", profiles.map((item) => item.id));

  const profileMap = new Map((linkedProfiles ?? []).map((item: any) => [item.id, item]));

  return profiles.map((item) => ({
    ...item,
    email: profileMap.get(item.id)?.email ?? null,
    phone_e164: profileMap.get(item.id)?.phone_e164 ?? null
  }));
}

export async function listBranches() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("branches")
    .select("id, code, name_en, name_my, city, township")
    .eq("is_active", true)
    .order("city", { ascending: true })
    .order("code", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BranchOption[];
}

export async function listOperatorMemberships(operatorId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("operator_branch_memberships")
    .select("id, branch_id, branch_code, role, is_primary")
    .eq("profile_id", operatorId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    id: item.id,
    branchId: item.branch_id,
    branchCode: item.branch_code,
    role: item.role,
    isPrimary: item.is_primary
  }));
}

export async function listOperatorAuditLogs(operatorId?: string | null, limit = 100): Promise<OperatorAuditItem[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("operator_admin_actions")
    .select("id, actor_profile_id, target_profile_id, action, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (operatorId) {
    query = query.eq("target_profile_id", operatorId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as any[];
  const ids = Array.from(new Set(rows.flatMap((item) => [item.actor_profile_id, item.target_profile_id]).filter(Boolean)));
  const { data: names } = ids.length
    ? await supabase.from("operator_profiles").select("id, full_name").in("id", ids as string[])
    : { data: [] as any[] };

  const nameMap = new Map((names ?? []).map((item: any) => [item.id, item.full_name]));

  return rows.map((item) => ({
    id: item.id,
    action: item.action,
    metadata: item.metadata ?? {},
    created_at: item.created_at,
    actor_profile_id: item.actor_profile_id,
    target_profile_id: item.target_profile_id,
    actor_name: item.actor_profile_id ? nameMap.get(item.actor_profile_id) ?? null : null,
    target_name: item.target_profile_id ? nameMap.get(item.target_profile_id) ?? null : null
  }));
}

export async function createOperatorAccount({
  email,
  password,
  fullName,
  phone,
  appRole,
  preferredLanguage,
  primaryBranchId,
  primaryBranchCode
}: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  appRole: string;
  preferredLanguage: "en" | "my";
  primaryBranchId: string | null;
  primaryBranchCode: string | null;
}) {
  const supabase = createAdminClient();
  const normalizedRole = normalizeRole(appRole) ?? "STAFF";
  const branchRole = mapAppRoleToBranchRole(normalizedRole);

  const authResponse = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: normalizedRole,
      full_name: fullName
    }
  });

  if (authResponse.error || !authResponse.data.user) {
    throw new Error(authResponse.error?.message ?? "Failed to create auth user.");
  }

  const authUser = authResponse.data.user;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: authUser.id,
        email,
        phone_e164: phone,
        role: normalizedRole,
        is_active: true,
        must_change_password: true,
        requires_password_change: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

  if (profileError) throw new Error(profileError.message);

  const { data: operatorProfile, error: operatorError } = await supabase
    .from("operator_profiles")
    .insert({
      auth_user_id: authUser.id,
      profile_id: authUser.id,
      role: normalizedRole,
      app_role: normalizedRole,
      full_name: fullName,
      preferred_language: preferredLanguage,
      primary_branch_id: primaryBranchId,
      primary_branch_code: primaryBranchCode,
      must_change_password: true,
      is_active: true,
      phone_e164: phone
    })
    .select("id, auth_user_id, profile_id, role, app_role, full_name, preferred_language, primary_branch_id, primary_branch_code, must_change_password, is_active")
    .single();

  if (operatorError || !operatorProfile) throw new Error(operatorError?.message ?? "Failed to create operator profile.");

  if (primaryBranchId && primaryBranchCode) {
    const { error: membershipError } = await supabase
      .from("operator_branch_memberships")
      .upsert(
        {
          profile_id: operatorProfile.id,
          branch_id: primaryBranchId,
          branch_code: primaryBranchCode,
          role: branchRole,
          is_primary: true
        },
        { onConflict: "profile_id,branch_id" }
      );

    if (membershipError) throw new Error(membershipError.message);
  }

  return operatorProfile;
}

export async function updateOperatorAccount({
  operatorId,
  updates
}: {
  operatorId: string;
  updates: {
    full_name?: string;
    preferred_language?: "en" | "my";
    app_role?: string;
    is_active?: boolean;
    must_change_password?: boolean;
    primary_branch_id?: string | null;
    primary_branch_code?: string | null;
  };
}) {
  const supabase = createAdminClient();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof updates.full_name === "string") patch.full_name = updates.full_name;
  if (updates.preferred_language) patch.preferred_language = updates.preferred_language;
  if (typeof updates.is_active === "boolean") patch.is_active = updates.is_active;
  if (typeof updates.must_change_password === "boolean") patch.must_change_password = updates.must_change_password;
  if ("primary_branch_id" in updates) patch.primary_branch_id = updates.primary_branch_id ?? null;
  if ("primary_branch_code" in updates) patch.primary_branch_code = updates.primary_branch_code ?? null;
  if (updates.app_role) {
    const normalizedRole = normalizeRole(updates.app_role) ?? updates.app_role;
    patch.app_role = normalizedRole;
    patch.role = normalizedRole;
  }

  const { data, error } = await supabase
    .from("operator_profiles")
    .update(patch)
    .eq("id", operatorId)
    .select("id, auth_user_id, profile_id, role, app_role, full_name, preferred_language, primary_branch_id, primary_branch_code, must_change_password, is_active")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update operator.");

  if (typeof updates.must_change_password === "boolean" || typeof updates.is_active === "boolean") {
    await supabase
      .from("profiles")
      .update({
        must_change_password: updates.must_change_password,
        requires_password_change: updates.must_change_password,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", (data as any).profile_id ?? (data as any).auth_user_id);
  }

  return data;
}

export async function setPrimaryBranch({
  operatorId,
  branchId,
  branchCode,
  appRole
}: {
  operatorId: string;
  branchId: string;
  branchCode: string;
  appRole: string | null | undefined;
}) {
  const supabase = createAdminClient();
  const membershipRole = mapAppRoleToBranchRole(appRole);

  await supabase
    .from("operator_branch_memberships")
    .update({ is_primary: false })
    .eq("profile_id", operatorId);

  const { error } = await supabase
    .from("operator_branch_memberships")
    .upsert(
      {
        profile_id: operatorId,
        branch_id: branchId,
        branch_code: branchCode,
        role: membershipRole,
        is_primary: true
      },
      { onConflict: "profile_id,branch_id" }
    );

  if (error) throw new Error(error.message);

  const { error: profileError } = await supabase
    .from("operator_profiles")
    .update({
      primary_branch_id: branchId,
      primary_branch_code: branchCode,
      updated_at: new Date().toISOString()
    })
    .eq("id", operatorId);

  if (profileError) throw new Error(profileError.message);
}

export async function replaceOperatorMemberships({
  operatorId,
  appRole,
  memberships
}: {
  operatorId: string;
  appRole: string | null | undefined;
  memberships: MembershipInput[];
}) {
  const supabase = createAdminClient();
  if (!memberships.length) throw new Error("At least one branch membership is required.");
  const primaryCount = memberships.filter((item) => item.isPrimary).length;
  if (primaryCount !== 1) throw new Error("Exactly one primary branch membership is required.");

  const normalizedMemberships = memberships.map((item) => ({
    profile_id: operatorId,
    branch_id: item.branchId,
    branch_code: item.branchCode,
    role: item.role || mapAppRoleToBranchRole(appRole),
    is_primary: item.isPrimary
  }));

  const { error: deleteError } = await supabase
    .from("operator_branch_memberships")
    .delete()
    .eq("profile_id", operatorId);

  if (deleteError) throw new Error(deleteError.message);

  const { error: insertError } = await supabase
    .from("operator_branch_memberships")
    .insert(normalizedMemberships);

  if (insertError) throw new Error(insertError.message);

  const primary = normalizedMemberships.find((item) => item.is_primary)!;
  const { error: profileError } = await supabase
    .from("operator_profiles")
    .update({
      primary_branch_id: primary.branch_id,
      primary_branch_code: primary.branch_code,
      updated_at: new Date().toISOString()
    })
    .eq("id", operatorId);

  if (profileError) throw new Error(profileError.message);

  return normalizedMemberships;
}

export async function sendInviteEmail({
  email,
  redirectTo
}: {
  email: string;
  redirectTo?: string | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, redirectTo ? { redirectTo } : {});
  if (error) throw new Error(error.message);
  return data;
}

export async function generateRecoveryLink({
  email,
  redirectTo
}: {
  email: string;
  redirectTo?: string | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: redirectTo ? { redirectTo } : undefined
  });
  if (error) throw new Error(error.message);
  return data;
}

export function ensureAssignable(actorRole: string | null | undefined, targetRole: string) {
  const actor = normalizeRole(actorRole) ?? "STAFF";
  const target = normalizeRole(targetRole) ?? "STAFF";
  if (actor === "SUPER_ADMIN" || actor === "APP_OWNER") return true;
  if (actor === "OPERATIONS_ADMIN") {
    return !["SUPER_ADMIN", "APP_OWNER", "SYS"].includes(target);
  }
  if (actor === "HR_ADMIN") {
    return getAssignableAppRoles(actor).includes(target);
  }
  return false;
}
