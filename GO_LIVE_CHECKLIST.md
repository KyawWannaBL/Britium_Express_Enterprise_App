# Go-live checklist

## A. Preflight
- [ ] Custom domain configured in Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` matches the final domain
- [ ] Supabase Auth redirect URLs include:
  - [ ] `https://YOUR_DOMAIN/auth/callback`
  - [ ] `https://YOUR_DOMAIN/auth/confirm`
  - [ ] `https://YOUR_DOMAIN/auth/reset-password`
- [ ] Vercel env vars set for Preview and Production
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set only on Vercel / trusted server
- [ ] Mapbox token restricted by allowed URLs if possible
- [ ] SMTP configured in Supabase Auth for invite/reset email flows
- [ ] Storage bucket `bulk-imports` created and private
- [ ] Edge Functions deployed
- [ ] RLS policies verified with real operator accounts
- [ ] First branches created in database
- [ ] First operator roles and memberships bootstrapped

## B. Staging deploy
- [ ] Deploy admin app to Vercel Preview/Staging
- [ ] Run `supabase db push`
- [ ] Deploy Edge Functions
- [ ] Seed first admin
- [ ] Seed first branch memberships
- [ ] Verify sign-in, must-change-password, role guard, branch guard
- [ ] Verify Create Delivery end-to-end
- [ ] Verify Waybill print formats: 4x6, 4x3 two-up on 4x6, A4, A5
- [ ] Verify Way Management map renders and scan events write successfully
- [ ] Verify invite/reset email actions
- [ ] Verify bulk upload stores file and parser job runs

## C. Launch readiness
- [ ] Two-person review on service-role key storage
- [ ] Backup and restore tested
- [ ] At least one rollback path documented
- [ ] Audit logs visible to Super Admin
- [ ] Test operator suspension and re-activation
- [ ] Confirm QR labels render on target printers
- [ ] Confirm branch transfer and manifest flows

## D. Production cutover
- [ ] Freeze schema changes during cutover window
- [ ] Re-run `supabase db push` on production project
- [ ] Deploy Edge Functions to production
- [ ] Set production Vercel env vars
- [ ] Create first production Super Admin
- [ ] Create branch memberships
- [ ] Smoke test with 1 shipment booking, 1 print, 1 scan, 1 transfer
- [ ] Enable staff access

## E. First 24 hours
- [ ] Monitor sign-in failures
- [ ] Monitor print job failures
- [ ] Monitor scan-event failures
- [ ] Monitor bulk upload parser failures
- [ ] Monitor database errors / auth errors
- [ ] Check audit logs every few hours