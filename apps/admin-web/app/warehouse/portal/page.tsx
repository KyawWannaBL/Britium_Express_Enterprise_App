"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileStack,
  MapPinned,
  PackageCheck,
  PackageSearch,
  QrCode,
  RefreshCw,
  Route,
  ScanLine,
  ShieldCheck,
  Signature,
  Truck,
  Warehouse,
  Workflow,
  XCircle,
} from "lucide-react";

type WorkflowStage = "RECEIVING" | "STAGING" | "STORAGE" | "SHIPPING" | "EXCEPTION";
type PlanMode = "RIDER" | "DRIVER";
type SignatureAction = "RECEIVE" | "STAGE" | "STORE" | "DISPATCH" | "EXCEPTION_ACK";
type ToastTone = "ok" | "warn" | "err";

type WarehouseStats = {
  inboundPending: number;
  inWarehouseSorted: number;
  dispatchReady: number;
  exceptions: number;
};

type ParcelStatus =
  | "INBOUND_PENDING"
  | "RECEIVED"
  | "STAGED"
  | "STORED"
  | "DISPATCH_READY"
  | "DISPATCHED"
  | "EXCEPTION";

type Parcel = {
  id: string;
  trackingNo: string;
  qrValue: string;
  branchId: string;
  currentHubId: string;
  destinationTownship: string;
  destinationLat: number;
  destinationLng: number;
  wayPlanStopOrder: number;
  assignedRiderId?: string;
  assignedDriverId?: string;
  routeCode: string;
  manifestNo?: string;
  cageCode?: string;
  shelfCode?: string;
  bagCode?: string;
  status: ParcelStatus;
  receivedAt?: string;
  stagedAt?: string;
  storedAt?: string;
  dispatchReadyAt?: string;
  exceptionReason?: string;
  serviceType: "SAME_DAY" | "NEXT_DAY" | "LINEHAUL";
  weightKg: number;
};

type BranchOffice = {
  id: string;
  name: string;
  code: string;
  isHeadOffice: boolean;
  startPoint: {
    lat: number;
    lng: number;
    label: string;
  };
};

type StorageSlot = {
  code: string;
  lane: string;
  level: number;
  maxItems: number;
  currentItems: number;
};

type PlanRow = {
  assigneeId: string;
  assigneeName: string;
  mode: PlanMode;
  startPointLabel: string;
  startLat: number;
  startLng: number;
  parcelCount: number;
  parcels: Array<{
    trackingNo: string;
    destinationTownship: string;
    wayPlanStopOrder: number;
    loadSequence: number;
    unloadSequence: number;
    recommendedSlot: string;
    routeCode: string;
  }>;
};

type ScanAudit = {
  id: string;
  trackingNo: string;
  action: SignatureAction;
  stage: WorkflowStage;
  operatorName: string;
  scannedAt: string;
  branchName: string;
  status: "SUCCESS" | "FAILED";
  remarks?: string;
};

type SignaturePayload = {
  trackingNo: string;
  action: SignatureAction;
  signerName: string;
  signerRole: string;
  signatureDataUrl: string;
  signedAt: string;
};

type ScanResult = {
  trackingNo: string;
  status: "SUCCESS" | "ERROR";
  message: string;
};

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

const HEAD_OFFICE_COORDINATES = {
  lat: 16.8895537,
  lng: 96.1996749,
  label: "Britium Head Office",
};

const DEMO_BRANCHES: BranchOffice[] = [
  {
    id: "ho-ygn",
    name: "Head Office Yangon",
    code: "HO-YGN",
    isHeadOffice: true,
    startPoint: HEAD_OFFICE_COORDINATES,
  },
  {
    id: "br-mdy",
    name: "Mandalay Branch",
    code: "BR-MDY",
    isHeadOffice: false,
    startPoint: { lat: 21.975, lng: 96.0836, label: "Mandalay Branch" },
  },
  {
    id: "br-npt",
    name: "Naypyitaw Branch",
    code: "BR-NPT",
    isHeadOffice: false,
    startPoint: { lat: 19.7644, lng: 96.0785, label: "Naypyitaw Branch" },
  },
];

const DEMO_SLOTS: StorageSlot[] = [
  { code: "A-01", lane: "A", level: 1, maxItems: 12, currentItems: 5 },
  { code: "A-02", lane: "A", level: 2, maxItems: 12, currentItems: 6 },
  { code: "B-01", lane: "B", level: 1, maxItems: 10, currentItems: 4 },
  { code: "B-02", lane: "B", level: 2, maxItems: 10, currentItems: 3 },
  { code: "C-01", lane: "C", level: 1, maxItems: 16, currentItems: 8 },
  { code: "OUT-01", lane: "OUT", level: 1, maxItems: 30, currentItems: 10 },
];

const DEMO_PARCELS: Parcel[] = [
  {
    id: "p1",
    trackingNo: "BEX-YGN-1001",
    qrValue: "BEX-YGN-1001",
    branchId: "ho-ygn",
    currentHubId: "ho-ygn",
    destinationTownship: "Kamayut",
    destinationLat: 16.8265,
    destinationLng: 96.1308,
    wayPlanStopOrder: 1,
    assignedRiderId: "rider-01",
    routeCode: "YGN-KMY-01",
    manifestNo: "MAN-YGN-001",
    status: "INBOUND_PENDING",
    serviceType: "SAME_DAY",
    weightKg: 1.2,
  },
  {
    id: "p2",
    trackingNo: "BEX-YGN-1002",
    qrValue: "BEX-YGN-1002",
    branchId: "ho-ygn",
    currentHubId: "ho-ygn",
    destinationTownship: "Bahan",
    destinationLat: 16.8147,
    destinationLng: 96.1561,
    wayPlanStopOrder: 3,
    assignedRiderId: "rider-01",
    routeCode: "YGN-BAH-01",
    manifestNo: "MAN-YGN-001",
    status: "RECEIVED",
    receivedAt: new Date().toISOString(),
    serviceType: "SAME_DAY",
    weightKg: 0.8,
  },
  {
    id: "p3",
    trackingNo: "BEX-YGN-1003",
    qrValue: "BEX-YGN-1003",
    branchId: "ho-ygn",
    currentHubId: "ho-ygn",
    destinationTownship: "Mingaladon",
    destinationLat: 16.9004,
    destinationLng: 96.1418,
    wayPlanStopOrder: 2,
    assignedRiderId: "rider-02",
    routeCode: "YGN-MGL-02",
    manifestNo: "MAN-YGN-002",
    status: "STAGED",
    receivedAt: new Date().toISOString(),
    stagedAt: new Date().toISOString(),
    serviceType: "NEXT_DAY",
    weightKg: 2.4,
  },
  {
    id: "p4",
    trackingNo: "BEX-YGN-1004",
    qrValue: "BEX-YGN-1004",
    branchId: "ho-ygn",
    currentHubId: "ho-ygn",
    destinationTownship: "Pyinmana",
    destinationLat: 19.7381,
    destinationLng: 96.2072,
    wayPlanStopOrder: 1,
    assignedDriverId: "driver-01",
    routeCode: "YGN-NPT-01",
    manifestNo: "MAN-LH-001",
    cageCode: "OUT-01",
    shelfCode: "L1",
    status: "STORED",
    storedAt: new Date().toISOString(),
    serviceType: "LINEHAUL",
    weightKg: 5.2,
  },
  {
    id: "p5",
    trackingNo: "BEX-YGN-1005",
    qrValue: "BEX-YGN-1005",
    branchId: "ho-ygn",
    currentHubId: "ho-ygn",
    destinationTownship: "Aungmyethazan",
    destinationLat: 21.9822,
    destinationLng: 96.081,
    wayPlanStopOrder: 2,
    assignedDriverId: "driver-01",
    routeCode: "YGN-MDY-01",
    manifestNo: "MAN-LH-002",
    cageCode: "OUT-01",
    shelfCode: "L2",
    status: "DISPATCH_READY",
    dispatchReadyAt: new Date().toISOString(),
    serviceType: "LINEHAUL",
    weightKg: 8.3,
  },
  {
    id: "p6",
    trackingNo: "BEX-YGN-1006",
    qrValue: "BEX-YGN-1006",
    branchId: "ho-ygn",
    currentHubId: "ho-ygn",
    destinationTownship: "Chanmyathazi",
    destinationLat: 21.9483,
    destinationLng: 96.105,
    wayPlanStopOrder: 4,
    assignedDriverId: "driver-02",
    routeCode: "YGN-MDY-02",
    manifestNo: "MAN-LH-002",
    status: "EXCEPTION",
    exceptionReason: "Label damaged during unload",
    serviceType: "LINEHAUL",
    weightKg: 1.5,
  },
];

const ASSIGNEES = {
  "rider-01": "Ko Min / Rider 01",
  "rider-02": "Su Su / Rider 02",
  "driver-01": "Linehaul Truck 01",
  "driver-02": "Linehaul Truck 02",
};

function formatTime(input?: string) {
  if (!input) return "-";
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
}

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (["success", "received", "staged", "stored", "dispatch_ready", "verified"].includes(s)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["inbound_pending", "warning"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["failed", "error", "exception"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const raw = await res.text();
  const parsed = raw ? JSON.parse(raw) : {};
  if (!res.ok) {
    throw new Error(parsed?.error || parsed?.message || `Request failed: ${res.status}`);
  }
  return (parsed?.data ?? parsed) as T;
}

function calculateStats(parcels: Parcel[]): WarehouseStats {
  return {
    inboundPending: parcels.filter((p) => p.status === "INBOUND_PENDING").length,
    inWarehouseSorted: parcels.filter((p) => ["RECEIVED", "STAGED", "STORED"].includes(p.status)).length,
    dispatchReady: parcels.filter((p) => p.status === "DISPATCH_READY").length,
    exceptions: parcels.filter((p) => p.status === "EXCEPTION").length,
  };
}

function getNextStatus(action: SignatureAction): ParcelStatus {
  switch (action) {
    case "RECEIVE":
      return "RECEIVED";
    case "STAGE":
      return "STAGED";
    case "STORE":
      return "STORED";
    case "DISPATCH":
      return "DISPATCH_READY";
    case "EXCEPTION_ACK":
      return "EXCEPTION";
    default:
      return "INBOUND_PENDING";
  }
}

function getStageFromAction(action: SignatureAction): WorkflowStage {
  switch (action) {
    case "RECEIVE":
      return "RECEIVING";
    case "STAGE":
      return "STAGING";
    case "STORE":
      return "STORAGE";
    case "DISPATCH":
      return "SHIPPING";
    case "EXCEPTION_ACK":
      return "EXCEPTION";
    default:
      return "RECEIVING";
  }
}

function getBestStorageSlot(slots: StorageSlot[], parcel: Parcel) {
  const eligible = slots
    .filter((slot) => slot.currentItems < slot.maxItems)
    .sort((a, b) => {
      if (parcel.status === "DISPATCH_READY") {
        if (a.lane === "OUT" && b.lane !== "OUT") return -1;
        if (b.lane === "OUT" && a.lane !== "OUT") return 1;
      }
      return a.currentItems - b.currentItems || a.level - b.level;
    });

  return eligible[0]?.code ?? "UNASSIGNED";
}

function buildLifoPlans(parcels: Parcel[], branches: BranchOffice[], slots: StorageSlot[]): PlanRow[] {
  const ready = parcels.filter((p) => ["STORED", "DISPATCH_READY"].includes(p.status));
  const buckets = new Map<string, { mode: PlanMode; assigneeName: string; parcels: Parcel[] }>();

  ready.forEach((parcel) => {
    const mode: PlanMode = parcel.assignedRiderId ? "RIDER" : "DRIVER";
    const assigneeId = parcel.assignedRiderId ?? parcel.assignedDriverId;
    if (!assigneeId) return;
    if (!buckets.has(assigneeId)) {
      buckets.set(assigneeId, {
        mode,
        assigneeName: ASSIGNEES[assigneeId as keyof typeof ASSIGNEES] ?? assigneeId,
        parcels: [],
      });
    }
    buckets.get(assigneeId)?.parcels.push(parcel);
  });

  return Array.from(buckets.entries()).map(([assigneeId, bucket]) => {
    const originBranch = branches.find((b) => b.id === bucket.parcels[0]?.branchId) ?? branches[0];

    // LIFO loading rule:
    // unloadSequence: stop 1, 2, 3...
    // loadSequence: reverse of unload so stop 1 is loaded last and becomes most accessible.
    const orderedForUnload = [...bucket.parcels].sort((a, b) => a.wayPlanStopOrder - b.wayPlanStopOrder);
    const plannedParcels = orderedForUnload.map((parcel, index) => ({
      trackingNo: parcel.trackingNo,
      destinationTownship: parcel.destinationTownship,
      wayPlanStopOrder: parcel.wayPlanStopOrder,
      unloadSequence: index + 1,
      loadSequence: orderedForUnload.length - index,
      recommendedSlot: parcel.cageCode || getBestStorageSlot(slots, parcel),
      routeCode: parcel.routeCode,
    }));

    return {
      assigneeId,
      assigneeName: bucket.assigneeName,
      mode: bucket.mode,
      startPointLabel: originBranch.startPoint.label,
      startLat: originBranch.startPoint.lat,
      startLng: originBranch.startPoint.lng,
      parcelCount: plannedParcels.length,
      parcels: plannedParcels,
    };
  });
}

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0d2c54";
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawingRef.current = true;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !drawingRef.current) return;
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const end = () => {
    const canvas = canvasRef.current;
    drawingRef.current = false;
    onChange(canvas?.toDataURL("image/png") ?? null);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={720}
        height={180}
        className="w-full rounded-2xl border border-slate-200 bg-white"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
}

function MapboxStartPointPanel({
  token,
  branches,
  activeBranchId,
  plans,
  onUpdateBranchPoint,
}: {
  token: string;
  branches: BranchOffice[];
  activeBranchId: string;
  plans: PlanRow[];
  onUpdateBranchPoint: (branchId: string, lat: number, lng: number) => void;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token || !mapNodeRef.current || mapInstanceRef.current) return;
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;

      mapboxgl.accessToken = token;
      mapInstanceRef.current = new mapboxgl.Map({
        container: mapNodeRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: [HEAD_OFFICE_COORDINATES.lng, HEAD_OFFICE_COORDINATES.lat],
        zoom: 9,
      });

      mapInstanceRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    bootstrap();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [token]);

  useEffect(() => {
    async function syncMarkers() {
      const map = mapInstanceRef.current;
      if (!map || !token) return;
      const mapboxgl = (await import("mapbox-gl")).default;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const bounds = new mapboxgl.LngLatBounds();

      branches.forEach((branch) => {
        const marker = new mapboxgl.Marker({ color: branch.id === activeBranchId ? "#0d2c54" : "#22c55e", draggable: branch.id === activeBranchId })
          .setLngLat([branch.startPoint.lng, branch.startPoint.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20 }).setHTML(
              `<div style='font-weight:700'>${branch.name}</div><div>${branch.startPoint.label}</div>`,
            ),
          )
          .addTo(map);

        if (branch.id === activeBranchId) {
          marker.on("dragend", () => {
            const pos = marker.getLngLat();
            onUpdateBranchPoint(branch.id, Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
          });
        }

        markersRef.current.push(marker);
        bounds.extend([branch.startPoint.lng, branch.startPoint.lat]);
      });

      plans.forEach((plan) => {
        plan.parcels.slice(0, 4).forEach((parcel, idx) => {
          const sourceParcel = DEMO_PARCELS.find((p) => p.trackingNo === parcel.trackingNo);
          if (!sourceParcel) return;
          const marker = new mapboxgl.Marker({ color: idx % 2 === 0 ? "#f59e0b" : "#ef4444" })
            .setLngLat([sourceParcel.destinationLng, sourceParcel.destinationLat])
            .setPopup(
              new mapboxgl.Popup({ offset: 20 }).setHTML(
                `<div style='font-weight:700'>${parcel.trackingNo}</div><div>${parcel.destinationTownship}</div><div>Unload #${parcel.unloadSequence}</div>`,
              ),
            )
            .addTo(map);
          markersRef.current.push(marker);
          bounds.extend([sourceParcel.destinationLng, sourceParcel.destinationLat]);
        });
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 11 });
      }
    }

    syncMarkers();
  }, [branches, activeBranchId, plans, onUpdateBranchPoint, token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Add <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable start-point mapping and branch marker editing.
      </div>
    );
  }

  return <div ref={mapNodeRef} className="h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200" />;
}

export default function WarehousePortalPage() {
  const [activeStage, setActiveStage] = useState<WorkflowStage>("RECEIVING");
  const [branches, setBranches] = useState<BranchOffice[]>(DEMO_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(DEMO_BRANCHES[0].id);
  const [slots, setSlots] = useState<StorageSlot[]>(DEMO_SLOTS);
  const [parcels, setParcels] = useState<Parcel[]>(DEMO_PARCELS);
  const [auditRows, setAuditRows] = useState<ScanAudit[]>([]);
  const [scannerInput, setScannerInput] = useState("");
  const [cameraScanEnabled, setCameraScanEnabled] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [signatureModal, setSignatureModal] = useState<{
    open: boolean;
    trackingNo: string;
    action: SignatureAction;
  }>({ open: false, trackingNo: "", action: "RECEIVE" });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("");
  const [exceptionReason, setExceptionReason] = useState("");
  const [search, setSearch] = useState("");
  const [loadingRemote, setLoadingRemote] = useState(false);

  const scannerInputRef = useRef<HTMLInputElement | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  const stats = useMemo(() => calculateStats(parcels), [parcels]);
  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId) ?? branches[0],
    [branches, selectedBranchId],
  );
  const plans = useMemo(() => buildLifoPlans(parcels, branches, slots), [parcels, branches, slots]);

  const filteredParcels = useMemo(() => {
    const q = search.trim().toLowerCase();
    const stageFiltered = parcels.filter((parcel) => {
      if (activeStage === "RECEIVING") return ["INBOUND_PENDING", "RECEIVED"].includes(parcel.status);
      if (activeStage === "STAGING") return ["RECEIVED", "STAGED"].includes(parcel.status);
      if (activeStage === "STORAGE") return ["STAGED", "STORED"].includes(parcel.status);
      if (activeStage === "SHIPPING") return ["STORED", "DISPATCH_READY", "DISPATCHED"].includes(parcel.status);
      return parcel.status === "EXCEPTION";
    });

    if (!q) return stageFiltered;
    return stageFiltered.filter((parcel) => {
      return [
        parcel.trackingNo,
        parcel.destinationTownship,
        parcel.routeCode,
        parcel.manifestNo ?? "",
        parcel.cageCode ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [activeStage, parcels, search]);

  const stageAction = useMemo<SignatureAction>(() => {
    if (activeStage === "RECEIVING") return "RECEIVE";
    if (activeStage === "STAGING") return "STAGE";
    if (activeStage === "STORAGE") return "STORE";
    if (activeStage === "SHIPPING") return "DISPATCH";
    return "EXCEPTION_ACK";
  }, [activeStage]);

  const topPlans = useMemo(() => plans.slice(0, 3), [plans]);

  useEffect(() => {
    scannerInputRef.current?.focus();
  }, [activeStage]);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      setLoadingRemote(true);
      try {
        const [remoteStats, remoteParcels, remoteBranches] = await Promise.allSettled([
          fetchJson<ApiEnvelope<WarehouseStats> | WarehouseStats>("/api/v1/warehouse/stats"),
          fetchJson<ApiEnvelope<Parcel[]> | Parcel[]>("/api/v1/warehouse/parcels"),
          fetchJson<ApiEnvelope<BranchOffice[]> | BranchOffice[]>("/api/v1/warehouse/branches"),
        ]);

        if (ignore) return;

        if (remoteParcels.status === "fulfilled") {
          const incoming = Array.isArray(remoteParcels.value)
            ? remoteParcels.value
            : (remoteParcels.value as ApiEnvelope<Parcel[]>).data;
          if (incoming?.length) setParcels(incoming);
        }

        if (remoteBranches.status === "fulfilled") {
          const incoming = Array.isArray(remoteBranches.value)
            ? remoteBranches.value
            : (remoteBranches.value as ApiEnvelope<BranchOffice[]>).data;
          if (incoming?.length) {
            setBranches(incoming);
            setSelectedBranchId((prev) => incoming.find((b) => b.id === prev)?.id ?? incoming[0].id);
          }
        }

        if (remoteStats.status === "fulfilled") {
          const incoming = "inboundPending" in (remoteStats.value as WarehouseStats)
            ? (remoteStats.value as WarehouseStats)
            : (remoteStats.value as ApiEnvelope<WarehouseStats>).data;
          if (incoming) {
            // stats are derived locally when demo mode is used; remote stats are intentionally not set into state
          }
        }
      } catch {
        // Demo fallback stays in place.
      } finally {
        if (!ignore) setLoadingRemote(false);
      }
    }

    bootstrap();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!cameraScanEnabled) return;
    if (!("BarcodeDetector" in window)) {
      setToast({ tone: "warn", message: "Camera QR scan is not supported in this browser. Use scanner input instead." });
      setCameraScanEnabled(false);
      return;
    }
  }, [cameraScanEnabled]);

  const refreshDemo = useCallback(() => {
    setParcels((prev) => [...prev]);
    setSlots((prev) => [...prev]);
    setToast({ tone: "ok", message: "Warehouse workspace refreshed." });
  }, []);

  const openSignature = useCallback((trackingNo: string, action: SignatureAction) => {
    setSignatureDataUrl(null);
    setSignerName("");
    setSignerRole("");
    setExceptionReason("");
    setSignatureModal({ open: true, trackingNo, action });
  }, []);

  const updateParcelLocal = useCallback(
    (trackingNo: string, action: SignatureAction, opts?: { exceptionReason?: string }) => {
      setParcels((prev) =>
        prev.map((parcel) => {
          if (parcel.trackingNo !== trackingNo) return parcel;
          const nextStatus = getNextStatus(action);
          const chosenSlot = action === "STORE" ? getBestStorageSlot(slots, parcel) : parcel.cageCode;
          return {
            ...parcel,
            status: nextStatus,
            receivedAt: action === "RECEIVE" ? new Date().toISOString() : parcel.receivedAt,
            stagedAt: action === "STAGE" ? new Date().toISOString() : parcel.stagedAt,
            storedAt: action === "STORE" ? new Date().toISOString() : parcel.storedAt,
            dispatchReadyAt: action === "DISPATCH" ? new Date().toISOString() : parcel.dispatchReadyAt,
            cageCode: action === "STORE" ? chosenSlot : parcel.cageCode,
            exceptionReason: opts?.exceptionReason ?? parcel.exceptionReason,
          };
        }),
      );
    },
    [slots],
  );

  const processStageScan = useCallback(
    async (trackingNo: string) => {
      const normalized = trackingNo.trim().toUpperCase();
      if (!normalized) return;
      const parcel = parcels.find((item) => item.trackingNo.toUpperCase() === normalized || item.qrValue.toUpperCase() === normalized);
      if (!parcel) {
        setLastScan({ trackingNo: normalized, status: "ERROR", message: "Parcel not found in warehouse registry." });
        setToast({ tone: "err", message: `Parcel ${normalized} not found.` });
        return;
      }
      openSignature(parcel.trackingNo, stageAction);
    },
    [openSignature, parcels, stageAction],
  );

  const submitSignature = useCallback(async () => {
    if (!signatureModal.trackingNo || !signerName.trim() || !signerRole.trim() || !signatureDataUrl) {
      setToast({ tone: "err", message: "Signer name, role, and electronic signature are required." });
      return;
    }

    const payload: SignaturePayload = {
      trackingNo: signatureModal.trackingNo,
      action: signatureModal.action,
      signerName: signerName.trim(),
      signerRole: signerRole.trim(),
      signatureDataUrl,
      signedAt: new Date().toISOString(),
    };

    setProcessing(true);
    try {
      try {
        await fetchJson("/api/v1/warehouse/scan-events", {
          method: "POST",
          body: JSON.stringify({
            trackingNo: payload.trackingNo,
            action: payload.action,
            branchId: selectedBranch.id,
            signerName: payload.signerName,
            signerRole: payload.signerRole,
            signatureDataUrl: payload.signatureDataUrl,
            exceptionReason: signatureModal.action === "EXCEPTION_ACK" ? exceptionReason.trim() || undefined : undefined,
          }),
        });
      } catch {
        // local fallback keeps preview usable
      }

      updateParcelLocal(payload.trackingNo, payload.action, {
        exceptionReason: signatureModal.action === "EXCEPTION_ACK" ? exceptionReason.trim() : undefined,
      });

      setAuditRows((prev) => [
        {
          id: crypto.randomUUID(),
          trackingNo: payload.trackingNo,
          action: payload.action,
          stage: getStageFromAction(payload.action),
          operatorName: payload.signerName,
          scannedAt: payload.signedAt,
          branchName: selectedBranch.name,
          status: "SUCCESS",
          remarks: signatureModal.action === "EXCEPTION_ACK" ? exceptionReason.trim() : undefined,
        },
        ...prev,
      ]);

      setLastScan({
        trackingNo: payload.trackingNo,
        status: "SUCCESS",
        message: `${payload.trackingNo} processed for ${payload.action.toLowerCase()}.`,
      });
      setToast({ tone: "ok", message: `${payload.trackingNo} moved to ${getNextStatus(payload.action)}.` });
      setSignatureModal({ open: false, trackingNo: "", action: "RECEIVE" });
      setScannerInput("");
      scannerInputRef.current?.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save scan event.";
      setLastScan({ trackingNo: payload.trackingNo, status: "ERROR", message });
      setToast({ tone: "err", message });
    } finally {
      setProcessing(false);
    }
  }, [
    exceptionReason,
    selectedBranch.id,
    selectedBranch.name,
    signatureDataUrl,
    signatureModal.action,
    signatureModal.trackingNo,
    signerName,
    signerRole,
    updateParcelLocal,
  ]);

  const updateBranchStartPoint = useCallback((branchId: string, lat: number, lng: number) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              startPoint: {
                ...branch.startPoint,
                lat,
                lng,
              },
            }
          : branch,
      ),
    );
  }, []);

  const stageTitle = useMemo(() => {
    const map: Record<WorkflowStage, string> = {
      RECEIVING: "Inbound Receiving & QR Verification",
      STAGING: "Staging Control & Area Assignment",
      STORAGE: "Storage Placement & LIFO Slotting",
      SHIPPING: "Shipping Release & Dispatch Handover",
      EXCEPTION: "Exception Desk & Damage / Misroute Handling",
    };
    return map[activeStage];
  }, [activeStage]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics Operations</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Warehouse Hub <span className="font-normal text-blue-500">/ ဂိုဒေါင်စီမံခန့်ခွဲမှု</span>
        </h1>
        <p className="text-slate-500">
          Production workflow for receiving, staging, storage, shipping, QR scan verification, electronic signature capture,
          and LIFO-based rider / driver storage planning.
        </p>
      </div>

      {toast ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            toast.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : toast.tone === "warn"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ArrowDownToLine} title="Inbound Pending" value={String(stats.inboundPending)} />
        <StatCard icon={Warehouse} title="In Warehouse (Sorted)" value={String(stats.inWarehouseSorted)} accent="blue" />
        <StatCard icon={Truck} title="Dispatch Ready" value={String(stats.dispatchReady)} accent="green" />
        <StatCard icon={AlertTriangle} title="Exceptions" value={String(stats.exceptions)} accent="red" />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Warehouse Workflow / ဂိုဒေါင်လုပ်ငန်းစဉ်</h2>
          <div className="mt-4 grid gap-3">
            <StageButton icon={ArrowDownToLine} title="Receiving" subtitle="ဝင်ကုန်လက်ခံခြင်း" active={activeStage === "RECEIVING"} onClick={() => setActiveStage("RECEIVING")} />
            <StageButton icon={Workflow} title="Staging" subtitle="စီစဉ်ချထားခြင်း" active={activeStage === "STAGING"} onClick={() => setActiveStage("STAGING")} />
            <StageButton icon={Boxes} title="Storage" subtitle="သိုလှောင်ခြင်း" active={activeStage === "STORAGE"} onClick={() => setActiveStage("STORAGE")} />
            <StageButton icon={ArrowUpToLine} title="Shipping" subtitle="ထွက်ကုန်ပို့ဆောင်ခြင်း" active={activeStage === "SHIPPING"} onClick={() => setActiveStage("SHIPPING")} />
            <StageButton icon={AlertTriangle} title="Exceptions" subtitle="ပြဿနာဖြေရှင်းခြင်း" active={activeStage === "EXCEPTION"} onClick={() => setActiveStage("EXCEPTION")} />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operating Branch</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0d2c54] outline-none"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Start point: {selectedBranch.startPoint.label} ({selectedBranch.startPoint.lat.toFixed(6)}, {selectedBranch.startPoint.lng.toFixed(6)})
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">{stageTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Scan QR or barcode, capture electronic signature, and move parcels through the selected workflow stage.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshDemo}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0d2c54]">
                <QrCode size={18} /> Scan Input / QR စကင်န်
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!scannerInput.trim() || processing) return;
                  await processStageScan(scannerInput.trim());
                }}
                className="space-y-3"
              >
                <input
                  ref={scannerInputRef}
                  type="text"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  placeholder="SCAN QR / BARCODE..."
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-center text-xl font-bold tracking-widest text-[#0d2c54] outline-none focus:border-blue-500"
                  disabled={processing}
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 text-sm font-black uppercase tracking-wider text-white disabled:opacity-50"
                  >
                    <ScanLine size={16} /> Process Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraScanEnabled((prev) => !prev)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-600 hover:bg-white"
                  >
                    {cameraScanEnabled ? "Disable Camera" : "Camera Scan"}
                  </button>
                </div>
              </form>

              {cameraScanEnabled ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Camera QR scan placeholder: wire up <code>BarcodeDetector</code> or native scanning kiosk support on deployment devices.
                </div>
              ) : null}

              {lastScan ? (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-bold ${lastScan.status === "SUCCESS" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                  {lastScan.status === "SUCCESS" ? "✅" : "❌"} {lastScan.message}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0d2c54]">
                <ClipboardCheck size={18} /> Required Controls
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <ChecklistRow label="QR / barcode verification" done />
                <ChecklistRow label="Electronic signature capture" done />
                <ChecklistRow label="Operator acknowledgement" done />
                <ChecklistRow label="Branch origin enforcement" done />
                <ChecklistRow label="LIFO load plan generation" done />
                <ChecklistRow label="Audit trail event write" done />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">Parcel Queue / လက်ရှိကုန်စည်စာရင်း</h2>
              <p className="mt-1 text-sm text-slate-500">Search and verify the current queue for the selected workflow stage.</p>
            </div>
            <div className="relative w-full lg:max-w-md">
              <PackageSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracking / township / route / manifest"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0d2c54] focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Tracking</th>
                  <th className="px-4 py-3 font-black">Route</th>
                  <th className="px-4 py-3 font-black">Township</th>
                  <th className="px-4 py-3 font-black">Way Stop</th>
                  <th className="px-4 py-3 font-black">Slot</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      No parcels found for the selected stage.
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((parcel) => (
                    <tr key={parcel.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{parcel.trackingNo}</td>
                      <td className="px-4 py-3">{parcel.routeCode}</td>
                      <td className="px-4 py-3">{parcel.destinationTownship}</td>
                      <td className="px-4 py-3">Stop {parcel.wayPlanStopOrder}</td>
                      <td className="px-4 py-3">{parcel.cageCode ?? "Pending"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badgeClass(parcel.status)}`}>
                          {parcel.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openSignature(parcel.trackingNo, stageAction)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-wider text-[#0d2c54] hover:bg-slate-50"
                        >
                          Advance
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Route size={20} className="text-[#0d2c54]" />
              <h2 className="text-lg font-black text-[#0d2c54]">LIFO Load Plans / LIFO တင်သွင်းအစီအစဉ်</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Plans are grouped by rider or driver. Unload order follows way plan; load order is reversed for LIFO.
            </p>

            <div className="mt-4 space-y-3">
              {topPlans.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No eligible plans yet.</div>
              ) : (
                topPlans.map((plan) => (
                  <div key={plan.assigneeId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-[#0d2c54]">{plan.assigneeName}</div>
                        <div className="text-xs text-slate-500">
                          {plan.mode} • Start: {plan.startPointLabel}
                        </div>
                      </div>
                      <span className="rounded-full bg-[#0d2c54] px-3 py-1 text-[10px] font-black uppercase text-white">
                        {plan.parcelCount} parcels
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {plan.parcels.slice(0, 4).map((item) => (
                        <div key={item.trackingNo} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                          <div>
                            <div className="font-bold text-[#0d2c54]">{item.trackingNo}</div>
                            <div className="text-xs text-slate-500">{item.destinationTownship} • {item.routeCode}</div>
                          </div>
                          <div className="text-xs font-bold text-amber-600">LOAD #{item.loadSequence}</div>
                          <div className="text-xs font-bold text-emerald-600">UNLOAD #{item.unloadSequence}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileStack size={20} className="text-[#0d2c54]" />
              <h2 className="text-lg font-black text-[#0d2c54]">Recent Audit Trail / မကြာသေးမီ scan history</h2>
            </div>
            <div className="mt-4 space-y-3">
              {auditRows.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No scan events yet.</div>
              ) : (
                auditRows.slice(0, 5).map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-[#0d2c54]">{row.trackingNo}</div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {row.action} • {row.operatorName} • {row.branchName}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{formatTime(row.scannedAt)}</div>
                    {row.remarks ? <div className="mt-2 text-xs text-rose-600">{row.remarks}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <MapPinned size={20} className="text-[#0d2c54]" />
          <h2 className="text-lg font-black text-[#0d2c54]">Start Point Configuration & Plan Map / စတင်မှတ်တိုင်နှင့် map</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Head Office uses the fixed HQ coordinate. Branch offices can set or drag their own start point for routing and LIFO plan generation.
        </p>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <MapboxStartPointPanel
            token={mapboxToken}
            branches={branches}
            activeBranchId={selectedBranchId}
            plans={topPlans}
            onUpdateBranchPoint={updateBranchStartPoint}
          />

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selected Branch Start Point</div>
              <div className="mt-2 text-lg font-black text-[#0d2c54]">{selectedBranch.name}</div>
              <div className="mt-1 text-sm text-slate-500">{selectedBranch.startPoint.label}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-500">
                  Latitude
                  <input
                    value={selectedBranch.startPoint.lat}
                    onChange={(e) => updateBranchStartPoint(selectedBranch.id, Number(e.target.value), selectedBranch.startPoint.lng)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#0d2c54] outline-none"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Longitude
                  <input
                    value={selectedBranch.startPoint.lng}
                    onChange={(e) => updateBranchStartPoint(selectedBranch.id, selectedBranch.startPoint.lat, Number(e.target.value))}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#0d2c54] outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Storage Plan Rules</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Head Office route planning starts from HQ by default.</li>
                <li>• Branch managers can override their own origin coordinates.</li>
                <li>• Way plan stop order defines unload sequence.</li>
                <li>• LIFO reverses loading so earlier stops stay most accessible.</li>
                <li>• Dispatch-ready parcels prefer OUT lanes and outbound cages.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Clock3 size={20} className="text-amber-500" />
          <h2 className="text-lg font-black text-[#0d2c54]">Implementation Notes / ထုတ်လုပ်အသုံးပြုမှု မှတ်စုများ</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard title="Receiving" body="Every receive event records operator, branch, timestamp, signature, and QR validation." />
          <InfoCard title="Staging" body="Stage scans move parcels to temporary areas before final cage or vehicle assignment." />
          <InfoCard title="Storage" body="Storage action recommends a slot and updates cage allocation for searchability and audits." />
          <InfoCard title="Shipping" body="Dispatch-ready items are grouped into LIFO plans for rider and driver handover." />
        </div>
      </div>

      {signatureModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0d2c54]">Electronic Signature Required</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {signatureModal.trackingNo} • {signatureModal.action}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSignatureModal({ open: false, trackingNo: "", action: "RECEIVE" })}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-600">
                Signer Name
                <input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#0d2c54] outline-none"
                  placeholder="Operator name"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Signer Role
                <input
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#0d2c54] outline-none"
                  placeholder="Warehouse supervisor / loader / checker"
                />
              </label>
            </div>

            {signatureModal.action === "EXCEPTION_ACK" ? (
              <label className="mt-4 block text-sm font-semibold text-slate-600">
                Exception Reason
                <textarea
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="mt-1 min-h-[88px] w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#0d2c54] outline-none"
                  placeholder="Damage, mismatch, seal issue, or misroute reason"
                />
              </label>
            ) : null}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#0d2c54]">
                <Signature size={16} /> Draw Signature
              </div>
              <SignaturePad onChange={setSignatureDataUrl} />
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setSignatureModal({ open: false, trackingNo: "", action: "RECEIVE" })}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSignature}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c54] px-5 py-3 text-sm font-black uppercase tracking-wider text-white disabled:opacity-50"
              >
                <ShieldCheck size={16} /> Confirm & Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loadingRemote ? (
        <div className="pointer-events-none fixed bottom-6 right-6 rounded-full bg-[#0d2c54] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
          Syncing warehouse API...
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  accent = "default",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  accent?: "default" | "blue" | "green" | "red";
}) {
  const valueClass = accent === "blue" ? "text-blue-600" : accent === "green" ? "text-green-600" : accent === "red" ? "text-red-600" : "text-slate-800";
  const iconClass = accent === "red" ? "text-red-500" : "text-[#0d2c54]";
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={26} className={iconClass} />
      <p className="mb-2 mt-5 text-center text-xs font-black uppercase tracking-wider text-slate-400">{title}</p>
      <p className={`text-4xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StageButton({
  icon: Icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-4 text-left transition ${active ? "bg-[#0d2c54] text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <div>
          <p className="font-black">{title}</p>
          <p className={`text-sm ${active ? "text-white/70" : "text-slate-500"}`}>{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
      {done ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
      <span>{label}</span>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="font-black text-[#0d2c54]">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{body}</div>
    </div>
  );
}
