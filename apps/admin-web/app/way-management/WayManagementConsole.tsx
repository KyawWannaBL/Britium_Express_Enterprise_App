"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DualLine, MetricCard, SectionTitle, StatusPill } from "../_components/ui";
import WayOpsMap from "./WayOpsMap";

type Board = {
  mode: "live";
  branch: { id: string | null; code: string | null; latitude: number | null; longitude: number | null };
  operator: { fullName: string; role: string; branchCode: string | null };
  summary: { activeShipments: number; activeAssignments: number; openManifests: number; activeTransfers: number };
  dispatchRows: Array<{ id: string; trackingNumber: string; customer: string; route: string; serviceType: string; status: string; codAmount: number; fee: number; assignedVehicle: string | null }>;
  liveUnits: Array<{ id: string; code: string; driverName: string; type: string; status: string; fuelLevel: number | null; branch: string | null; marker: number; latitude: number | null; longitude: number | null; lastSeenAt: string | null; speedKph: number | null }>;
  chainRows: Array<{ id: string; shipmentId: string; waybillId: string; scanType: string; scannerType: string; scannedAt: string; branchCode: string | null; latitude: number | null; longitude: number | null; codAmountMmks: number; metadata: Record<string, unknown> }>;
  manifests: Array<{ id: string; manifestNumber: string; status: string; bagCode: string | null; sealCode: string | null; totalShipments: number; totalCodMmks: number; destinationBranchCode: string | null }>;
  transfers: Array<{ id: string; transferNumber: string; transferStatus: string; bagCode: string | null; sealCode: string | null; shipmentCount: number; codTotalMmks: number; toBranchCode: string | null }>;
  branchOptions: Array<{ id: string; code: string; label: string; latitude: number | null; longitude: number | null }>;
  vehicleOptions: Array<{ id: string; code: string; type: string; status: string }>;
};

const SCAN_TYPES = [
  { value: "pickup", en: "Pickup Scan", my: "ပစ္စည်းလက်ခံ Scan" },
  { value: "hub_in", en: "Hub In", my: "Hub အဝင်" },
  { value: "hub_out", en: "Hub Out", my: "Hub အထွက်" },
  { value: "transfer_out", en: "Transfer Out", my: "လွှဲပြောင်းအထွက်" },
  { value: "transfer_in", en: "Transfer In", my: "လွှဲပြောင်းအဝင်" },
  { value: "delivered", en: "Delivered", my: "ပို့ဆောင်ပြီး" }
];

function toneFromStatus(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("risk") || normalized.includes("delay") || normalized.includes("pending") || normalized.includes("prepared") || normalized.includes("failed")) return "warning";
  if (normalized.includes("busy") || normalized.includes("loading") || normalized.includes("transit") || normalized.includes("assigned") || normalized.includes("in_")) return "info";
  if (normalized.includes("delivered") || normalized.includes("active") || normalized.includes("ready") || normalized.includes("loaded") || normalized.includes("received") || normalized.includes("sealed")) return "success";
  return "pending";
}

function mmk(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function WayManagementConsole() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [destinationBranchId, setDestinationBranchId] = useState("");
  const [bagCode, setBagCode] = useState("BAG-YGN-OPS");
  const [sealCode, setSealCode] = useState("SEAL-0001");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [scanForm, setScanForm] = useState({
    shipmentId: "",
    waybillId: "",
    scanType: "pickup",
    scannerType: "mobile_camera",
    latitude: "",
    longitude: "",
    codAmountMmks: "",
    recipientName: "",
    notes: ""
  });
  const [locationForm, setLocationForm] = useState({
    vehicleId: "",
    latitude: "",
    longitude: "",
    speedKph: "",
    heading: ""
  });

  async function loadBoard() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/way-management/board", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load way management board.");
      setBoard(payload);
      if (!destinationBranchId && payload.branchOptions?.length > 1) {
        const alternative = payload.branchOptions.find((item: { code: string }) => item.code !== payload.branch?.code);
        if (alternative) setDestinationBranchId(alternative.id);
      }
      if (!vehicleId && payload.vehicleOptions?.[0]?.id) setVehicleId(payload.vehicleOptions[0].id);
      if (!locationForm.vehicleId && payload.vehicleOptions?.[0]?.id) {
        setLocationForm((current) => ({ ...current, vehicleId: payload.vehicleOptions[0].id }));
      }
      if (!scanForm.shipmentId && payload.dispatchRows?.[0]?.id) {
        const first = payload.dispatchRows[0];
        const chain = payload.chainRows.find((row: any) => row.shipmentId === first.id);
        setScanForm((current) => ({
          ...current,
          shipmentId: first.id,
          waybillId: chain?.waybillId ?? current.waybillId
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
    function onLiveRefresh() {
      loadBoard();
    }
    window.addEventListener("britium-live-refresh", onLiveRefresh);
    const interval = window.setInterval(loadBoard, 20000);
    return () => {
      window.removeEventListener("britium-live-refresh", onLiveRefresh);
      window.clearInterval(interval);
    };
  }, []);

  const selectedDispatchRows = useMemo(
    () => board?.dispatchRows.filter((row) => selectedShipments.includes(row.id)) ?? [],
    [board, selectedShipments]
  );

  async function postJson(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error ?? "Action failed.");
    }
    return payload;
  }

  async function handleCreateManifest() {
    if (!selectedShipments.length || !vehicleId || !destinationBranchId) {
      setFeedback("Select shipments, vehicle, and destination branch before creating a manifest.");
      return;
    }
    try {
      const payload = await postJson("/api/way-management/manifests/create", {
        shipmentIds: selectedShipments,
        assignedVehicleId: vehicleId,
        destinationBranchId,
        bagCode,
        sealCode
      });
      setFeedback(`Manifest ${payload.manifest?.manifest_number ?? "created"} is ready.`);
      setSelectedShipments([]);
      await loadBoard();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Manifest creation failed.");
    }
  }

  async function handleCreateTransfer() {
    const latestManifest = board?.manifests[0];
    if (!latestManifest || !destinationBranchId) {
      setFeedback("Create a manifest and choose a destination branch before opening a transfer.");
      return;
    }
    try {
      const payload = await postJson("/api/way-management/transfers/create", {
        manifestId: latestManifest.id,
        toBranchId: destinationBranchId,
        bagCode,
        sealCode
      });
      setFeedback(`Transfer ${payload.transfer?.transfer_number ?? "created"} has been logged.`);
      await loadBoard();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Transfer creation failed.");
    }
  }

  async function handleCreateScanEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const payload = await postJson("/api/way-management/scan-events/create", scanForm);
      setFeedback(`Scan event ${payload.event?.scan_type ?? "created"} recorded at ${payload.event?.branch_code ?? board?.branch?.code ?? ""}.`);
      setScanForm((current) => ({ ...current, notes: "", codAmountMmks: current.scanType === "delivered" ? current.codAmountMmks : "" }));
      await loadBoard();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Scan event creation failed.");
    }
  }

  async function handleLiveLocationUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await postJson("/api/way-management/live-location/upsert", locationForm);
      setFeedback("Vehicle marker updated on the live map.");
      await loadBoard();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Location update failed.");
    }
  }

  if (loading) {
    return <p className="muted">Loading live way management board…</p>;
  }

  if (error || !board) {
    return <p className="muted">{error ?? "Unable to load board."}</p>;
  }

  return (
    <div className="stack-24">
      <SectionTitle
        eyebrow="Way Management"
        title="Live dispatch, route map, and custody control"
        copy="Industrial-grade operations board for Yangon, Mandalay, Naypyitaw, and network expansion. Live driver markers flow into Mapbox GL, and scan-event creation drives custody visibility from pickup to delivered."
        action={
          <div className="action-row">
            <StatusPill tone="info">{board.operator.branchCode ?? "No branch"} scoped</StatusPill>
            <Link href="/print/waybill?format=four_by_six" className="btn btn-secondary">
              Open print queue
            </Link>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Active Shipments" value={String(board.summary.activeShipments)} meta="Branch-scoped load" />
        <MetricCard label="Active Assignments" value={String(board.summary.activeAssignments)} meta="Dispatch / rider actions" />
        <MetricCard label="Open Manifests" value={String(board.summary.openManifests)} meta="Ready for transfer" />
        <MetricCard label="Active Transfers" value={String(board.summary.activeTransfers)} meta="Inter-branch movement" />
      </div>

      {feedback ? <div className="notice-banner">{feedback}</div> : null}

      <section className="ops-grid">
        <article className="panel panel-map">
          <div className="panel-head">
            <div>
              <h3>Mapbox route planning panel</h3>
              <p className="muted">Live branch map with driver markers and realtime updates from Supabase.</p>
            </div>
            <StatusPill tone="success">{board.liveUnits.length} live units</StatusPill>
          </div>
          <WayOpsMap branch={board.branch} liveUnits={board.liveUnits} />
          <div className="driver-list">
            {board.liveUnits.map((unit) => (
              <div key={unit.id} className="driver-row">
                <div>
                  <strong>{unit.driverName}</strong>
                  <div className="muted">{unit.code} · {unit.type} · {unit.branch ?? "—"}</div>
                </div>
                <div className="driver-meta">
                  <StatusPill tone={toneFromStatus(unit.status)}>{unit.status}</StatusPill>
                  <span>{unit.speedKph ?? 0} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Dispatch board</h3>
              <p className="muted">Select shipments and convert them into manifests and branch transfers.</p>
            </div>
          </div>
          <div className="table-shell">
            <table className="ops-table">
              <thead>
                <tr>
                  <th />
                  <th>Tracking</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>COD</th>
                  <th>Vehicle</th>
                </tr>
              </thead>
              <tbody>
                {board.dispatchRows.map((row) => {
                  const checked = selectedShipments.includes(row.id);
                  return (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setSelectedShipments((current) =>
                              event.target.checked ? [...current, row.id] : current.filter((item) => item !== row.id)
                            );
                            if (!scanForm.shipmentId) {
                              const chain = board.chainRows.find((item) => item.shipmentId === row.id);
                              setScanForm((current) => ({ ...current, shipmentId: row.id, waybillId: chain?.waybillId ?? current.waybillId }));
                            }
                          }}
                        />
                      </td>
                      <td>{row.trackingNumber}</td>
                      <td>{row.customer}</td>
                      <td>{row.route}</td>
                      <td>{row.serviceType}</td>
                      <td><StatusPill tone={toneFromStatus(row.status)}>{row.status}</StatusPill></td>
                      <td>{mmk(row.codAmount)} MMK</td>
                      <td>{row.assignedVehicle ?? "Unassigned"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ops-form-grid">
            <label>
              <span>Assigned vehicle</span>
              <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                <option value="">Select vehicle</option>
                {board.vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.code} · {vehicle.type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Destination branch</span>
              <select value={destinationBranchId} onChange={(event) => setDestinationBranchId(event.target.value)}>
                <option value="">Select branch</option>
                {board.branchOptions.filter((item) => item.code !== board.branch.code).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Bag code</span>
              <input value={bagCode} onChange={(event) => setBagCode(event.target.value)} />
            </label>
            <label>
              <span>Seal code</span>
              <input value={sealCode} onChange={(event) => setSealCode(event.target.value)} />
            </label>
          </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={handleCreateManifest}>Create manifest</button>
            <button className="btn btn-secondary" onClick={handleCreateTransfer}>Create transfer</button>
            <span className="badge">{selectedDispatchRows.length} selected shipments</span>
          </div>
        </article>
      </section>

      <section className="ops-grid ops-grid-secondary">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Scan chain-of-custody</h3>
              <p className="muted">Record pickup, hub-in, hub-out, transfer-out, transfer-in, and delivered events.</p>
            </div>
            <StatusPill tone="success">{board.chainRows.length} recent scans</StatusPill>
          </div>

          <form className="stack-16" onSubmit={handleCreateScanEvent}>
            <div className="ops-form-grid">
              <label>
                <span>Shipment</span>
                <select
                  value={scanForm.shipmentId}
                  onChange={(event) => {
                    const shipmentId = event.target.value;
                    const chain = board.chainRows.find((row: any) => row.shipmentId === shipmentId);
                    setScanForm((current) => ({ ...current, shipmentId, waybillId: chain?.waybillId ?? current.waybillId }));
                  }}
                >
                  <option value="">Select shipment</option>
                  {board.dispatchRows.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.trackingNumber} · {row.customer}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Waybill</span>
                <input value={scanForm.waybillId} onChange={(event) => setScanForm((current) => ({ ...current, waybillId: event.target.value }))} />
              </label>
              <label>
                <span>Scan type</span>
                <select value={scanForm.scanType} onChange={(event) => setScanForm((current) => ({ ...current, scanType: event.target.value }))}>
                  {SCAN_TYPES.map((scan) => (
                    <option key={scan.value} value={scan.value}>
                      {scan.en}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Scanner type</span>
                <select value={scanForm.scannerType} onChange={(event) => setScanForm((current) => ({ ...current, scannerType: event.target.value }))}>
                  <option value="mobile_camera">Mobile camera</option>
                  <option value="handheld_scanner">Handheld scanner</option>
                  <option value="counter_station">Counter station</option>
                </select>
              </label>
              <label>
                <span>Latitude</span>
                <input value={scanForm.latitude} onChange={(event) => setScanForm((current) => ({ ...current, latitude: event.target.value }))} placeholder={String(board.branch.latitude ?? "")} />
              </label>
              <label>
                <span>Longitude</span>
                <input value={scanForm.longitude} onChange={(event) => setScanForm((current) => ({ ...current, longitude: event.target.value }))} placeholder={String(board.branch.longitude ?? "")} />
              </label>
              <label>
                <span>COD MMK</span>
                <input value={scanForm.codAmountMmks} onChange={(event) => setScanForm((current) => ({ ...current, codAmountMmks: event.target.value }))} placeholder="0" />
              </label>
              <label>
                <span>Recipient name</span>
                <input value={scanForm.recipientName} onChange={(event) => setScanForm((current) => ({ ...current, recipientName: event.target.value }))} />
              </label>
            </div>
            <label>
              <span>Notes</span>
              <textarea rows={3} value={scanForm.notes} onChange={(event) => setScanForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <button className="btn btn-primary" type="submit">Create scan event</button>
          </form>

          <div className="timeline">
            {board.chainRows.map((row) => (
              <div key={row.id} className="timeline-row">
                <div className="timeline-dot" />
                <div>
                  <div className="timeline-title">{row.scanType.replace(/_/g, " ").toUpperCase()} · {row.branchCode ?? "—"}</div>
                  <div className="muted">
                    {new Date(row.scannedAt).toLocaleString()} · {row.scannerType} · {row.codAmountMmks ? `${mmk(row.codAmountMmks)} MMK` : "No COD"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <h3>Live driver marker controls</h3>
              <p className="muted">Update vehicle positions to drive the map and route board in real time.</p>
            </div>
          </div>

          <form className="stack-16" onSubmit={handleLiveLocationUpdate}>
            <div className="ops-form-grid">
              <label>
                <span>Vehicle</span>
                <select value={locationForm.vehicleId} onChange={(event) => setLocationForm((current) => ({ ...current, vehicleId: event.target.value }))}>
                  <option value="">Select vehicle</option>
                  {board.vehicleOptions.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.code} · {vehicle.type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Latitude</span>
                <input value={locationForm.latitude} onChange={(event) => setLocationForm((current) => ({ ...current, latitude: event.target.value }))} placeholder={String(board.branch.latitude ?? "")} />
              </label>
              <label>
                <span>Longitude</span>
                <input value={locationForm.longitude} onChange={(event) => setLocationForm((current) => ({ ...current, longitude: event.target.value }))} placeholder={String(board.branch.longitude ?? "")} />
              </label>
              <label>
                <span>Speed km/h</span>
                <input value={locationForm.speedKph} onChange={(event) => setLocationForm((current) => ({ ...current, speedKph: event.target.value }))} placeholder="32" />
              </label>
              <label>
                <span>Heading</span>
                <input value={locationForm.heading} onChange={(event) => setLocationForm((current) => ({ ...current, heading: event.target.value }))} placeholder="180" />
              </label>
            </div>
            <button className="btn btn-primary" type="submit">Update live marker</button>
          </form>

          <div className="stack-16">
            <div className="panel-head">
              <h4 style={{ margin: 0 }}>Open manifests</h4>
            </div>
            {board.manifests.map((manifest) => (
              <div key={manifest.id} className="manifest-card">
                <div>
                  <strong>{manifest.manifestNumber}</strong>
                  <div className="muted">Bag {manifest.bagCode ?? "—"} · Seal {manifest.sealCode ?? "—"}</div>
                </div>
                <div className="driver-meta">
                  <StatusPill tone={toneFromStatus(manifest.status)}>{manifest.status}</StatusPill>
                  <span>{manifest.totalShipments} shipments</span>
                </div>
              </div>
            ))}
          </div>

          <div className="stack-16">
            <div className="panel-head">
              <h4 style={{ margin: 0 }}>Transfers</h4>
            </div>
            {board.transfers.map((transfer) => (
              <div key={transfer.id} className="manifest-card">
                <div>
                  <strong>{transfer.transferNumber}</strong>
                  <div className="muted">{transfer.toBranchCode ?? "—"} · Bag {transfer.bagCode ?? "—"} · Seal {transfer.sealCode ?? "—"}</div>
                </div>
                <div className="driver-meta">
                  <StatusPill tone={toneFromStatus(transfer.transferStatus)}>{transfer.transferStatus}</StatusPill>
                  <span>{transfer.shipmentCount} shipments</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Industrial references and next deployment checkpoints</h3>
            <p className="muted">Route logic and map visuals remain linked to your uploaded operational references.</p>
          </div>
        </div>
        <div className="action-row">
          <Link href="/references/Abank%20delivery1.html" className="btn btn-secondary">ABank map reference</Link>
          <Link href="/references/wayplan_final_engine.py" className="btn btn-secondary">Way plan engine</Link>
          <Link href="/references/WayBill.png" className="btn btn-secondary">Waybill design sample</Link>
        </div>
      </section>
    </div>
  );
}
