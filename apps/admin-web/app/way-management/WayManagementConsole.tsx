"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { MetricCard, SectionTitle, StatusPill } from "../_components/ui";
import WayOpsMap from "./WayOpsMap";

// --- Types ---
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

// --- Helpers ---
function toneFromStatus(value: string) {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("risk") || normalized.includes("delay") || normalized.includes("pending")) return "warning";
  if (normalized.includes("transit") || normalized.includes("assigned")) return "info";
  if (normalized.includes("delivered") || normalized.includes("active") || normalized.includes("success")) return "success";
  return "pending";
}

function mmk(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0) + " MMK";
}

export default function WayManagementConsole() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const loadBoard = useCallback(async () => {
    try {
      const response = await fetch("/api/way-management/board", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to load board");
      setBoard(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
    const interval = setInterval(loadBoard, 30000);
    return () => clearInterval(interval);
  }, [loadBoard]);

  if (loading) return <div className="p-8 muted">Loading board...</div>;
  if (error || !board) return <div className="p-8 alert alert-danger">{error || "Data error"}</div>;

  return (
    <div className="stack-24">
      <SectionTitle
        eyebrow="Way Management"
        title="Live Dispatch & Map"
        copy="Manage inter-branch manifests and live driver positions."
        action={
          <div className="action-row">
            <StatusPill tone="info">HQ: {board.branch?.code ?? "N/A"}</StatusPill>
            <Link href="/create-delivery" className="btn btn-secondary">Create Delivery</Link>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Active Shipments" value={String(board.summary.activeShipments)} meta="In Branch" />
        <MetricCard label="Open Manifests" value={String(board.summary.openManifests)} meta="Ready to move" />
        <MetricCard label="Active Transfers" value={String(board.summary.activeTransfers)} meta="In Transit" />
      </div>

      <section className="ops-grid">
        <article className="panel">
          <div className="panel-head">
            <h3>Mapbox Live View</h3>
            <StatusPill tone="success">{board.liveUnits.length} Drivers Online</StatusPill>
          </div>
          <WayOpsMap branch={board.branch} liveUnits={board.liveUnits} />
        </article>

        <article className="panel">
          <div className="panel-head"><h3>Dispatch Table</h3></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Tracking</th><th>Status</th><th>COD</th></tr></thead>
              <tbody>
                {board.dispatchRows.map(row => (
                  <tr key={row.id}>
                    <td>{row.trackingNumber}</td>
                    <td><StatusPill tone={toneFromStatus(row.status)}>{row.status}</StatusPill></td>
                    <td>{mmk(row.codAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}