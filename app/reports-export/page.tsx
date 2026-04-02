"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, Wallet, Users, Route, RefreshCw } from "lucide-react";
import { envList, tryPostCandidates } from "@/lib/ops-api";

const SHIPMENT_EXPORT_ENDPOINTS = envList("NEXT_PUBLIC_REPORT_SHIPMENT_EXPORT_ENDPOINTS", [
  "/api/v1/exports/shipments",
  "/api/exports/shipments",
]);

const FINANCE_EXPORT_ENDPOINTS = envList("NEXT_PUBLIC_REPORT_FINANCE_EXPORT_ENDPOINTS", [
  "/api/v1/exports/finance",
  "/api/exports/finance",
]);

const OPERATOR_EXPORT_ENDPOINTS = envList("NEXT_PUBLIC_REPORT_OPERATOR_EXPORT_ENDPOINTS", [
  "/api/v1/exports/operators",
  "/api/exports/operators",
]);

const WAYPLAN_EXPORT_ENDPOINTS = envList("NEXT_PUBLIC_REPORT_WAYPLAN_EXPORT_ENDPOINTS", [
  "/api/v1/exports/way-plans",
  "/api/exports/way-plans",
]);

export default function ReportsExportPage() {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function startExport(
    type: "shipment" | "finance" | "operator" | "wayplan"
  ) {
    setBusy(type);
    setMessage("");
    setError("");

    try {
      const endpoints =
        type === "shipment"
          ? SHIPMENT_EXPORT_ENDPOINTS
          : type === "finance"
          ? FINANCE_EXPORT_ENDPOINTS
          : type === "operator"
          ? OPERATOR_EXPORT_ENDPOINTS
          : WAYPLAN_EXPORT_ENDPOINTS;

      const result = await tryPostCandidates<{ job_id?: string }>(endpoints, {
        export_type: type,
      });

      setMessage(
        result?.job_id
          ? `Export job accepted. Job ID: ${result.job_id}`
          : "Export job accepted."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Export request failed. Please verify export endpoints."
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Cross-Platform</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Reports Export Center <span className="font-normal">/ အစီရင်ခံစာထုတ်ယူမှု</span>
        </h1>
        <p className="text-slate-500">
          Shipment export, finance export, operator export, and way plan or manifest export in one workspace.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 whitespace-pre-line">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ExportCard
          icon={<FileSpreadsheet size={24} className="text-[#0d2c54]" />}
          title="Shipment Export"
          mm="ကုန်စည်ထုတ်ယူမှု"
          onClick={() => startExport("shipment")}
          busy={busy === "shipment"}
        />
        <ExportCard
          icon={<Wallet size={24} className="text-[#0d2c54]" />}
          title="Finance Export"
          mm="ငွေကြေးထုတ်ယူမှု"
          onClick={() => startExport("finance")}
          busy={busy === "finance"}
        />
        <ExportCard
          icon={<Users size={24} className="text-[#0d2c54]" />}
          title="Operator Export"
          mm="ဝန်ထမ်းထုတ်ယူမှု"
          onClick={() => startExport("operator")}
          busy={busy === "operator"}
        />
        <ExportCard
          icon={<Route size={24} className="text-[#0d2c54]" />}
          title="Way Plan / Manifest Export"
          mm="လမ်းကြောင်းနှင့် မန်နီဖက်ထုတ်ယူမှု"
          onClick={() => startExport("wayplan")}
          busy={busy === "wayplan"}
        />
      </div>
    </div>
  );
}

function ExportCard({
  icon,
  title,
  mm,
  onClick,
  busy,
}: {
  icon: React.ReactNode;
  title: string;
  mm: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {icon}
      <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#0d2c54]">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{mm}</p>
      <button
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white"
      >
        {busy ? <RefreshCw size={14} /> : <Download size={14} />}
        {busy ? "Starting..." : "Start Export"}
      </button>
    </div>
  );
}
