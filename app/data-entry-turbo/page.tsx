"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  FileUp,
  RefreshCw,
  TriangleAlert,
  CheckCircle2,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { downloadRejectRows, downloadSampleTemplate, parseUpload, ParsedRow, toBulkPayload } from "@/lib/data-entry-bulk";
import { tryPostCandidates, envList, formatMMK } from "@/lib/ops-api";

const BULK_ENDPOINTS = envList("NEXT_PUBLIC_DATA_ENTRY_BULK_ENDPOINTS", [
  "/api/v1/shipments/bulk-upload",
  "/api/shipments/bulk-upload",
]);

export default function DataEntryTurboPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const summary = useMemo(() => {
    const total = rows.length;
    const valid = rows.filter((row) => row.valid).length;
    const invalid = total - valid;
    const totalCollectable = rows
      .filter((row) => row.valid)
      .reduce((sum, row) => sum + row.normalized.total_collectable, 0);
    return { total, valid, invalid, totalCollectable };
  }, [rows]);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    setResultMessage("");
    setFileName(file.name);

    try {
      const parsed = await parseUpload(file);
      setRows(parsed);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "Failed to parse upload file.");
    } finally {
      setBusy(false);
    }
  }

  async function submitValidRows() {
    setBusy(true);
    setError("");
    setResultMessage("");

    try {
      const result = await tryPostCandidates<{ job_id?: string }>(BULK_ENDPOINTS, {
        source_filename: fileName || "bulk-upload.xlsx",
        rows: toBulkPayload(rows),
      });
      setResultMessage(
        result?.job_id
          ? `Bulk upload accepted. Job ID: ${result.job_id}`
          : "Bulk upload accepted."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bulk upload failed. Please verify the API endpoint."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Data Entry Turbo <span className="font-normal">/ အစုလိုက်ဒေတာထည့်သွင်းမှု</span>
        </h1>
        <p className="text-slate-500">
          Bulk Excel upload, bilingual sample template download, row validation, and bulk booking submission.
        </p>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Bulk Upload Workspace / အစုလိုက်တင်သွင်းမှု</h2>

          <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-3 text-slate-600">
              <FileUp size={18} />
              <span className="font-bold">Upload .xlsx, .xls, or .csv</span>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="mt-4 block w-full text-sm"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {fileName && (
              <p className="mt-3 text-sm text-slate-500">
                Current file: <span className="font-black text-[#0d2c54]">{fileName}</span>
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-black uppercase tracking-wider text-[#0d2c54] hover:bg-slate-200"
            >
              <Download size={16} />
              Download Template
            </button>

            <button
              onClick={() => downloadRejectRows(rows)}
              disabled={rows.filter((row) => !row.valid).length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-black uppercase tracking-wider text-[#0d2c54] disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              Download Rejects
            </button>

            <button
              onClick={submitValidRows}
              disabled={busy || summary.valid === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-5 py-3 font-black uppercase tracking-wider text-[#0d2c54] disabled:opacity-50"
            >
              <Upload size={16} />
              Submit Valid Rows
            </button>

            <button
              onClick={() => {
                setRows([]);
                setFileName("");
                setError("");
                setResultMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 font-black uppercase tracking-wider text-white"
            >
              <RefreshCw size={16} />
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 whitespace-pre-line">
              {error}
            </div>
          )}

          {resultMessage && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {resultMessage}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Validation Summary / စစ်ဆေးမှုအကျဉ်းချုပ်</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <StatCard title="Total Rows" value={String(summary.total)} />
            <StatCard title="Valid Rows" value={String(summary.valid)} good />
            <StatCard title="Invalid Rows" value={String(summary.invalid)} bad />
            <StatCard title="Total Collectable" value={formatMMK(summary.totalCollectable)} />
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <Rule text="Way ID is required and must be unique inside the file." />
            <Rule text="Recipient name, phone, township, and address are required." />
            <Rule text="Weight and charge values must be non-negative numbers." />
            <Rule text="Only valid rows are submitted to the bulk booking API." />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#0d2c54]">Validation Grid / စစ်ဆေးမှုဇယား</h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-black">Row</th>
                <th className="px-4 py-3 font-black">Way ID</th>
                <th className="px-4 py-3 font-black">Recipient</th>
                <th className="px-4 py-3 font-black">Phone</th>
                <th className="px-4 py-3 font-black">Township</th>
                <th className="px-4 py-3 font-black">Total</th>
                <th className="px-4 py-3 font-black">Status</th>
                <th className="px-4 py-3 font-black">Errors</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No uploaded rows yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.rowNo} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3">{row.rowNo}</td>
                    <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.normalized.way_id}</td>
                    <td className="px-4 py-3">{row.normalized.recipient_name}</td>
                    <td className="px-4 py-3">{row.normalized.recipient_phone}</td>
                    <td className="px-4 py-3">{row.normalized.township}</td>
                    <td className="px-4 py-3">{formatMMK(row.normalized.total_collectable)}</td>
                    <td className="px-4 py-3">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">
                          <CheckCircle2 size={12} />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase text-rose-700">
                          <TriangleAlert size={12} />
                          Invalid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs text-rose-600">
                        {row.errors.length === 0 ? (
                          <span className="text-emerald-600">No errors</span>
                        ) : (
                          row.errors.map((err, idx) => <div key={idx}>{err}</div>)
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  good = false,
  bad = false,
}: {
  title: string;
  value: string;
  good?: boolean;
  bad?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className={`mt-3 text-4xl font-black ${good ? "text-emerald-600" : bad ? "text-rose-600" : "text-[#0d2c54]"}`}>
        {value}
      </p>
    </div>
  );
}

function Rule({ text }: { text: string }) {
  return <div className="rounded-2xl bg-slate-50 px-4 py-3">{text}</div>;
}
