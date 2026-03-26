require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || "SUPER_ADMIN";
  const fullName = process.argv[5] || "Britium Super Admin";
  const preferredLanguage = process.argv[6] || "en";

  if (!email || !password) {
    console.error("Usage: node scripts/seed_first_admin.js <email> <temporaryPassword> [role] [fullName] [preferredLanguage]");
    process.exit(1);
  }

  let userId;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: fullName }
  });

  if (error) {
    if ((error.message || "").toLowerCase().includes("already")) {
      const existing = await findUserByEmail(email);
      if (!existing) throw new Error(`User exists but could not be found: ${email}`);
      userId = existing.id;
    } else {
      throw error;
    }
  } else {
    userId = data.user.id;
  }

  // Upsert profile-ish row. Adjust table name if your app uses operator_profiles instead of profiles.
  const profilePayload = {
    id: userId,
    email,
    full_name: fullName,
    role,
    preferred_language: preferredLanguage,
    is_active: true,
    must_change_password: true
  };

  let result = await supabase.from("operator_profiles").upsert(profilePayload, { onConflict: "id" });
  if (result.error && /relation .*operator_profiles/i.test(result.error.message || "")) {
    result = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
  }
  if (result.error) throw result.error;

  console.log(JSON.stringify({ ok: true, userId, email, role, must_change_password: true }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});