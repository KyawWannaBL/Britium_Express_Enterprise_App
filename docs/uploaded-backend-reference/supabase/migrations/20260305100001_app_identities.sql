-- 2026-03-05: Identity schema repair (schema-safe)
-- Creates/normalizes app identity tables and exposes a stable public.app_identities view.

BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role text DEFAULT 'USER',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  business_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  department text,
  is_active boolean DEFAULT true
);

CREATE OR REPLACE VIEW public.app_identities AS
WITH me AS (
  SELECT
    auth.uid() AS auth_user_id,
    LOWER(COALESCE(auth.jwt() ->> 'email', public.jwt_claim('email'), '')) AS jwt_email
)
SELECT
  me.auth_user_id,
  NULLIF(me.jwt_email, '') AS email,
  u.id AS user_id,
  m.id AS merchant_id,
  c.id AS customer_id,
  ue.id AS user_enhanced_id,
  NULL::uuid AS admin_user_id,
  COALESCE(
    ue.role::text,
    p.role::text,
    u.role::text,
    NULL
  ) AS primary_role
FROM me
LEFT JOIN public.profiles p
  ON p.id = me.auth_user_id
LEFT JOIN public.users_enhanced ue
  ON ue.auth_user_id = me.auth_user_id
LEFT JOIN public.users u
  ON u.id = me.auth_user_id
  OR LOWER(COALESCE(u.email, '')) = me.jwt_email
LEFT JOIN public.merchants m
  ON m.user_id = me.auth_user_id
  OR LOWER(COALESCE(m.email, '')) = me.jwt_email
LEFT JOIN public.customers c
  ON LOWER(COALESCE(c.email, '')) = me.jwt_email;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT user_id FROM public.app_identities;
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT primary_role FROM public.app_identities;
$$;

COMMIT;
