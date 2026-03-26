# SPEC-1-Britium-Express-Delivery

## Background

Britium Express Delivery is a Myanmar-first parcel and courier platform inspired by DHL-style shipment booking, tracking, dispatch, and proof-of-delivery workflows. It is designed for bilingual Myanmar and English operation and will launch with customer mobile app, courier mobile app, and admin web across Yangon, Mandalay, and Naypyitaw.

The initial deployment uses first-party riders, but the platform is designed to support third-party fleets later. Core workflows include booking, quotation, waybill printing, QR/barcode scans across the custody chain, dispatch, route planning, proof of delivery, COD settlement, and analytics.

## Requirements

### Must Have
- Bilingual Myanmar/English UX and notifications
- Customer shipment booking and tracking
- Courier app with offline-capable scan and delivery flows
- Admin dispatch portal
- Waybill printing with QR/barcode
- Chain-of-custody scan logging
- OTP/photo/signature proof of delivery
- COD and settlement tracking
- Mapbox-based route planning
- Role-based access control
- Audit logs and production observability

### Should Have
- Hub/branch manifest operations
- Business shipper accounts
- Route optimization and batch assignment
- SLA risk scoring
- Returns and reverse logistics
- Financial and operational reporting

## Method

### Platform
- **Admin web**: Next.js for Vercel
- **Mobile apps**: Expo React Native (customer + courier)
- **Backend**: Supabase Postgres, Auth, Storage, Realtime, Edge Functions
- **Maps**: Mapbox
- **Printing**: QR label/waybill generation with branch reprint audit trails

### Why Vercel + Supabase
Next.js deploys natively on Vercel with zero-configuration support and platform optimizations. Supabase provides Postgres, Auth, Storage, Realtime, and Edge Functions in one managed stack, which keeps the MVP simpler than running a large custom backend from day one. Expo SDK 55 provides a current, practical path for shipping React Native apps with modern tooling and camera support for QR scanning.

### Core entities
- users
- profiles
- branches
- couriers
- shipments
- shipment_events
- waybills
- scan_events
- proofs_of_delivery
- cod_transactions
- route_plans
- notifications

### Waybill and chain of custody
Every shipment has a tracking number and waybill. The QR payload should carry a signed token referencing the shipment instead of exposing raw PII. Each handoff—pickup, branch inbound, manifest load, manifest unload, destination inbound, out-for-delivery, delivered, returned—creates an append-only scan event.

### Route planning
Mapbox Directions provides routes and ETAs. Mapbox Optimization is used for multi-stop plans and dispatcher way plans. Route snapshots should be persisted for auditability.

## Implementation

1. Set up Supabase project, Auth, Storage buckets, and base schema.
2. Build admin web for booking oversight, dispatch, and waybill printing.
3. Build customer app for booking and tracking.
4. Build courier app for scan-based execution and POD.
5. Add route planning and SLA scoring.
6. Add COD reconciliation and finance reports.
7. Harden security, monitoring, and backups.
8. Pilot in Yangon, Mandalay, and Naypyitaw.

## Milestones

1. Foundation stack on Vercel + Supabase
2. Booking and tracking MVP
3. Waybill + QR scan chain
4. Route planning + POD
5. COD finance + reporting
6. Launch readiness and pilot rollout

## Gathering Results

- On-time pickup and delivery
- Scan compliance at each custody handoff
- Tracking freshness
- POD capture success
- COD remittance accuracy
- Admin intervention rate
- App crash-free sessions

## Need Professional Help in Developing Your Architecture?

Please contact me at [sammuti.com](https://sammuti.com) :)
