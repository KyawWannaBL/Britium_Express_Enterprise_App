import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export async function requireOpsAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: operator, error } = await supabase
    .from("operators")
    .select(`
      id, 
      role, 
      full_name,
      operator_branch_memberships (
        branch_id, 
        is_primary, 
        branches (code)
      )
    `)
    .eq("id", user.id)
    .single();

  if (error || !operator) {
    throw new Error("No Authority");
  }

  const primary = (operator as any).operator_branch_memberships?.[0];
  
  // FIX: Handle the case where 'branches' is returned as an array by the Supabase join
  const rawBranches = primary?.branches;
  const branchCode = Array.isArray(rawBranches) 
    ? rawBranches[0]?.code 
    : (rawBranches as any)?.code;

  return {
    user,
    id: operator.id,
    role: operator.role,
    fullName: operator.full_name,
    branchCode: branchCode || 'HO',
    branchId: primary?.branch_id
  };
}

export const getOpsIdentity = requireOpsAccess;
