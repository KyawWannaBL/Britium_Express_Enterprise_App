
# Create Delivery backend

This pass converts Create Delivery from mostly mocked flows into a transactional Supabase-backed module.

## Added data model
- `customers`
- `addresses`
- `quote_requests`
- `pickup_requests`
- `bulk_upload_jobs`

## Extended existing model
- `shipments` now links to customer, sender/recipient address, quote request, and pickup request.
- `waybills` remain the print anchor.
- `scan_events` receive the first `booking_created` chain-of-custody entry.

## API flow
1. `POST /api/quotes`
   - Computes commercial rate
   - Persists `quote_requests`
2. `POST /api/deliveries`
   - Upserts customer by phone
   - Creates sender and recipient addresses
   - Persists quote request
   - Creates pickup request
   - Creates shipment
   - Creates waybill with QR payload
   - Writes first scan event
3. `POST /api/pickups/bulk`
   - Registers merchant/customer bulk upload jobs for Excel/CSV intake
4. `POST /api/waybills/print`
   - Reads waybills by shipment
   - Increments print counters and timestamps

## Production notes
- Use `SUPABASE_SERVICE_ROLE_KEY` for server-side mutations from Next route handlers.
- Move rate logic into a dedicated pricing table or edge function before commercial launch.
- Add idempotency keys for client retries in the next pass.
- Add file parsing and validation for true Excel bulk upload in the next pass.
