require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("ERROR: Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEFAULT_PASSWORD = process.env.DEFAULT_OPERATOR_PASSWORD || "P@ssw0rd1";

const USERS = [
  { email: "bd_assist@britiumexpress.com", role: "STAFF" },
  { email: "rider_ygn0001@britiumexpress.com", role: "RIDER" },
  { email: "md@britiumexpress.com", role: "APP_OWNER" },
  { email: "br_mgr1@britiumexpress.com", role: "SUPERVISOR" },
  { email: "admin@britiumexpress.com", role: "SUPER_ADMIN" },
  { email: "warehouse_mgr@britiumexpress.com", role: "WAREHOUSE_MANAGER" },
  { email: "merchant_01@britiumexpress.com", role: "MERCHANT" },
  { email: "driver_ygn001@britiumexpress.com", role: "DRIVER" },
  { email: "cs_1@britiumexpress.com", role: "CUSTOMER_SERVICE" },
  { email: "finance@britiumexpress.com", role: "FINANCE_STAFF" },
  { email: "cashier_1@britiumexpress.com", role: "FINANCE_USER" },
  { email: "mgkyawwanna@gmail.com", role: "SUPER_ADMIN" },
  { email: "aln_br@britiumexpress.com", role: "SUBSTATION_MANAGER" },
  { email: "hradmin_am@britiumexpress.com", role: "HR_ADMIN" },
  { email: "dataentry001@britiumexpress.com", role: "DATA_ENTRY" },
  { email: "helper_ygn001@britiumexpress.com", role: "HELPER" },
  { email: "info@britiumexpress.com", role: "MARKETING_ADMIN" },
  { email: "hod@britiumexpress.com", role: "OPERATIONS_ADMIN" },
  { email: "sai@britiumexpress.com", role: "SUPER_ADMIN" },
  { email: "customer_01@britiumexpress.com", role: "CUSTOMER" },
  { email: "admin_npw@britiumexpress.com", role: "SUBSTATION_MANAGER" },
];

function legacyOperatorRole(appRole) {
  if (["SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN"].includes(appRole)) return "admin";
  if (["SUPERVISOR"].includes(appRole)) return "dispatcher";
  if (["FINANCE_USER", "FINANCE_STAFF"].includes(appRole)) return "finance";
  if (["SUBSTATION_MANAGER"].includes(appRole)) return "branch_manager";
  return "ops";
}

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureProfile(userId, email, role) {
  const fullName = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const { data: existing, error: fetchError } = await supabase
    .from("operator_profiles")
    .select("id, profile_id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  let profileId = existing?.profile_id || null;

  if (!profileId) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        role: "admin",
        full_name: fullName,
        phone_e164: `seed-${userId.slice(0, 8)}`,
        preferred_language: "en",
        email,
        is_active: true,
        must_change_password: true,
      })
      .select("id")
      .single();
    if (profileError) throw profileError;
    profileId = profile.id;
  } else {
    await supabase
      .from("profiles")
      .update({ email, is_active: true, must_change_password: true, updated_at: new Date().toISOString() })
      .eq("id", profileId);
  }

  const payload = {
    auth_user_id: userId,
    profile_id: profileId,
    role: legacyOperatorRole(role),
    app_role: role,
    full_name: fullName,
    preferred_language: "en",
    primary_branch_code: "YGN",
    is_active: true,
    must_change_password: true,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase.from("operator_profiles").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("operator_profiles").insert(payload);
    if (error) throw error;
  }
}

async function run() {
  console.log(`Starting account generation for ${USERS.length} accounts...`);
  for (const u of USERS) {
    let userId = null;

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { role: u.role, must_change_password: true },
    });

    if (error) {
      if (error.message?.toLowerCase().includes("already")) {
        const existing = await findUserByEmail(u.email);
        if (!existing) {
          console.error(`Could not resolve existing user: ${u.email}`);
          continue;
        }
        userId = existing.id;
      } else {
        console.error(`createUser failed for ${u.email}: ${error.message}`);
        continue;
      }
    } else {
      userId = data.user.id;
    }

    try {
      await ensureProfile(userId, u.email, u.role);
      console.log(`OK: ${u.email} -> ${u.role}`);
    } catch (profileError) {
      console.error(`Profile upsert failed for ${u.email}: ${profileError.message}`);
    }
  }
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
