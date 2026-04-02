# Britium Express - User Acceptance Testing (UAT) Plan

## 🟢 Level 1: Counter Staff & Data Entry Operator
**Objective:** Verify that physical parcels can be rapidly booked and received.
* **Test 1.1: High-Speed Booking:** Open `/data-entry-turbo`. Enter Tracking Number, Recipient, Delivery Fee, and COD. Click "Create Entry". Verify success message and queue update.
* **Test 1.2: Intake Scanning:** Open `/intake-console`. Scan the barcode. Verify the Live Scan Log flashes green (SUCCESS) and status updates to `received`.

## 🔵 Level 2: Warehouse Sorter & Packer
**Objective:** Verify internal tracking, sorting, and secure bagging.
* **Test 2.1: Inbound Processing:** Open `/warehouse/portal`. Scan the parcel. Verify it moves from "Inbound Pending" to "In Warehouse (Sorted)".
* **Test 2.2: Bag Creation:** Open `/warehouse/bagging`. Create a new bag with an ID and Destination. Verify it appears in the active dropdown.
* **Test 2.3: Packing the Bag:** Select the new bag. Scan the parcel. Verify the UI updates the "Current Bag Capacity" to 1.

## 🟡 Level 3: Dispatcher & Logistics Manager
**Objective:** Verify active transit routes and physical label generation.
* **Test 3.1: Transit Monitoring:** Open `/way-management`. Verify the parcel appears in the list with the correct status and COD collectable amount.
* **Test 3.2: Label Generation:** Open `/waybill-print-studio`. Select the parcel and click "Print Selected". Verify the thermal label layout renders and the print dialog opens.

## 🟠 Level 4: Delivery Rider
**Objective:** Verify field deliveries and Cash on Delivery (COD) remittance.
* **Test 4.1: Task Visibility:** Open `/rider/portal`. Verify the assigned parcel appears in the "Active Workspace".
* **Test 4.2: Successful Delivery:** Click "DELIVERED". Verify the parcel leaves the queue, "COMPLETED" increases by 1, and the COD amount is added to "COD TO REMIT".
* **Test 4.3: Exception Handling:** Click "FAILED" on a test parcel. Verify it leaves the queue, "FAILED" increases by 1, and no COD is added.

## 🔴 Level 5: Managing Director / Supervisor
**Objective:** Verify leadership has a real-time view of network health.
* **Test 5.1: Live Telemetry:** Open `/supervisor-control-hub`. Verify the "Daily Success Target" progress bar is accurate and the "Escalation Queue" turns red if there are failed deliveries.
