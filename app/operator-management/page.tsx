"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, KeyRound, ArrowUpCircle, ArrowDownCircle, UserCheck, Ban, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { envList, tryPostCandidates, toText } from "@/lib/ops-api";

type OperatorRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  approvalStatus: string;
  accountStatus: string;
  passwordStatus: string;
  lastLogin: string;
  raw: Record<string, unknown>;
};

const APPROVE_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_APPROVE_ENDPOINTS", [
  "/api/v1/operators/{id}/approve",
  "/api/operators/{id}/approve",
]);
const BLOCK_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_BLOCK_ENDPOINTS", [
  "/api/v1/operators/{id}/block",
  "/api/operators/{id}/block",
]);
const UNBLOCK_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_UNBLOCK_ENDPOINTS", [
  "/api/v1/operators/{id}/unblock",
  "/api/operators/{id}/unblock",
]);
const PROMOTE_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_PROMOTE_ENDPOINTS", [
  "/api/v1/operators/{id}/promote",
  "/api/operators/{id}/promote",
]);
const DEMOTE_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_DEMOTE_ENDPOINTS", [
  "/api/v1/operators/{id}/demote",
  "/api/operators/{id}/demote",
]);
const DEFAULT_PASSWORD_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_DEFAULT_PASSWORD_ENDPOINTS", [
  "/api/v1/operators/{id}/set-default-password",
  "/api/operators/{id}/set-default-password",
]);
const FORCE_RESET_ENDPOINTS = envList("NEXT_PUBLIC_OPERATOR_FORCE_RESET_ENDPOINTS", [
  "/api/v1/operators/{id}/force-password-reset",
  "/api/operators/{id}/force-password-reset",
]);

function withId(paths: string[], id: string) {
  return paths.map((p) => p.replaceAll("{id}", encodeURIComponent(id)));
}

function normalizeOperator(row: Record<string, unknown>): OperatorRow {
  const statusRaw =
    row.account_status ??
    row.status ??
    (typeof row.is_active === "boolean" ? (row.is_active ? "active" : "inactive") : null);

  const approvalRaw =
    row.approval_status ??
    (typeof row.approved === "boolean" ? (row.approved ? "approved" : "pending") : null);

  const passwordRaw =
    row.password_status ??
    (typeof row.must_change_password === "boolean"
      ? (row.must_change_password ? "must_change_password" : "ok")
      : null);

  return {
    id: toText(row.id),
    name: toText(row.full_name, row.name, row.username, row.email, "Unknown"),
    email: toText(row.email),
    phone: toText(row.phone, row.phone_number),
    role: toText(row.role, row.role_code, "unknown"),
    branch: toText(row.branch_name, row.branch, row.branch_code, "-"),
    approvalStatus: toText(approvalRaw, "pending"),
    accountStatus: toText(statusRaw, "active"),
    passwordStatus: toText(passwordRaw, "ok"),
    lastLogin: toText(row.last_login_at, "-"),
    raw: row,
  };
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["approved", "active", "ok"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["pending", "must_change_password"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["blocked", "inactive", "rejected"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function OperatorManagementPage() {
  const supabase = createClient();

  const [role, setRole] = useState("GUEST");
  const [rows, setRows] = useState<OperatorRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [targetRole, setTargetRole] = useState("supervisor");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) || null,
    [rows, selectedId]
  );

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    setMessage("");
    setTempPassword("");

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (currentUser?.id) {
      const { data: me } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      setRole(toText(me?.role, me?.role_code, "GUEST"));
    }

    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      setRows([]);
      setError(error.message);
      return;
    }

    const normalized = (data || []).map((r) => normalizeOperator(r as Record<string, unknown>));
    normalized.sort((a, b) => a.name.localeCompare(b.name));
    setRows(normalized);
    if (!selectedId && normalized[0]?.id) setSelectedId(normalized[0].id);
  }

  async function patchLocalProfile(row: OperatorRow, patch: Record<string, unknown>) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", row.id);
    if (error) throw error;
  }

  async function doAction(action: "approve" | "block" | "unblock" | "promote" | "demote" | "default-password" | "force-reset") {
    if (role !== "SYS") {
      setError("Only SYS users can perform operator admin actions.");
      return;
    }
    if (!selected) return;

    setBusy(action);
    setError("");
    setMessage("");
    setTempPassword("");

    try {
      if (action === "approve") {
        try {
          await tryPostCandidates(withId(APPROVE_ENDPOINTS, selected.id), { reason });
        } catch {
          await patchLocalProfile(selected, { approval_status: "approved" });
        }
        setMessage("Account approved.");
      }

      if (action === "block") {
        try {
          await tryPostCandidates(withId(BLOCK_ENDPOINTS, selected.id), { reason });
        } catch {
          await patchLocalProfile(selected, { account_status: "blocked", status: "blocked", is_active: false });
        }
        setMessage("Account blocked.");
      }

      if (action === "unblock") {
        try {
          await tryPostCandidates(withId(UNBLOCK_ENDPOINTS, selected.id), { reason });
        } catch {
          await patchLocalProfile(selected, { account_status: "active", status: "active", is_active: true });
        }
        setMessage("Account unblocked.");
      }

      if (action === "promote") {
        try {
          await tryPostCandidates(withId(PROMOTE_ENDPOINTS, selected.id), {
            target_role: targetRole,
            reason,
          });
        } catch {
          await patchLocalProfile(selected, { role: targetRole, role_code: targetRole });
        }
        setMessage(`Role updated to ${targetRole}.`);
      }

      if (action === "demote") {
        try {
          await tryPostCandidates(withId(DEMOTE_ENDPOINTS, selected.id), {
            target_role: targetRole,
            reason,
          });
        } catch {
          await patchLocalProfile(selected, { role: targetRole, role_code: targetRole });
        }
        setMessage(`Role updated to ${targetRole}.`);
      }

      if (action === "default-password") {
        const result = await tryPostCandidates<{ temporary_password?: string }>(
          withId(DEFAULT_PASSWORD_ENDPOINTS, selected.id),
          {
            generate_temporary_password: true,
            must_change_password: true,
            reason,
          }
        );
        setTempPassword(result?.temporary_password || "");
        setMessage("Temporary password issued. User must change password at next login.");
      }

      if (action === "force-reset") {
        await tryPostCandidates(withId(FORCE_RESET_ENDPOINTS, selected.id), {
          must_change_password: true,
          reason,
        });
        setMessage("Password reset requirement has been applied.");
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Administration</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Operator Management <span className="font-normal">/ ဝန်ထမ်းစီမံခန့်ခွဲမှု</span>
        </h1>
        <p className="text-slate-500">
          SYS-only account approval, role promotion or demotion, block or unblock, and password control.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="font-black text-[#0d2c54]">Current role:</span>{" "}
        <span className={role === "SYS" ? "font-black text-emerald-600" : "font-black text-rose-600"}>
          {role}
        </span>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 whitespace-pre-line">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      {tempPassword && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          Temporary password: <span className="font-mono">{tempPassword}</span>
        </div>
      )}

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0d2c54]">Operators</h2>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Name</th>
                  <th className="px-4 py-3 font-black">Role</th>
                  <th className="px-4 py-3 font-black">Branch</th>
                  <th className="px-4 py-3 font-black">Approval</th>
                  <th className="px-4 py-3 font-black">Account</th>
                  <th className="px-4 py-3 font-black">Password</th>
                  <th className="px-4 py-3 font-black">Manage</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      No operator records found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#0d2c54]">{row.name}</div>
                        <div className="text-xs text-slate-400">{row.email || row.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-3">{row.role}</td>
                      <td className="px-4 py-3">{row.branch}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.approvalStatus)}`}>{row.approvalStatus}</span></td>
                      <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.accountStatus)}`}>{row.accountStatus}</span></td>
                      <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.passwordStatus)}`}>{row.passwordStatus}</span></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedId(row.id)}
                          className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider ${
                            selectedId === row.id ? "bg-[#ffd700] text-[#0d2c54]" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Action Panel</h2>

          {!selected ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-slate-500">
              Select an operator to manage.
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="font-black text-[#0d2c54]">{selected.name}</div>
                <div className="mt-1 text-sm text-slate-500">{selected.role} · {selected.branch}</div>
                <div className="mt-1 text-sm text-slate-500">Last login: {selected.lastLogin}</div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <option value="rider">rider</option>
                  <option value="senior_rider">senior_rider</option>
                  <option value="data_entry">data_entry</option>
                  <option value="supervisor">supervisor</option>
                  <option value="warehouse_staff">warehouse_staff</option>
                  <option value="warehouse_supervisor">warehouse_supervisor</option>
                  <option value="cs_agent">cs_agent</option>
                  <option value="cs_lead">cs_lead</option>
                  <option value="branch_manager">branch_manager</option>
                  <option value="finance_user">finance_user</option>
                  <option value="finance_manager">finance_manager</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Reason / Note
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  placeholder="Enter reason"
                />
              </div>

              <div className="mt-5 grid gap-3">
                <ActionButton icon={<UserCheck size={15} />} label="Approve Account" onClick={() => doAction("approve")} busy={busy === "approve"} disabled={role !== "SYS"} />
                <ActionButton icon={<Ban size={15} />} label="Block Account" onClick={() => doAction("block")} busy={busy === "block"} disabled={role !== "SYS"} />
                <ActionButton icon={<ShieldCheck size={15} />} label="Unblock Account" onClick={() => doAction("unblock")} busy={busy === "unblock"} disabled={role !== "SYS"} />
                <ActionButton icon={<ArrowUpCircle size={15} />} label="Promote / Set Role" onClick={() => doAction("promote")} busy={busy === "promote"} disabled={role !== "SYS"} />
                <ActionButton icon={<ArrowDownCircle size={15} />} label="Demote / Set Role" onClick={() => doAction("demote")} busy={busy === "demote"} disabled={role !== "SYS"} />
                <ActionButton icon={<KeyRound size={15} />} label="Set Default Password" onClick={() => doAction("default-password")} busy={busy === "default-password"} disabled={role !== "SYS"} />
                <ActionButton icon={<ShieldAlert size={15} />} label="Force Password Reset" onClick={() => doAction("force-reset")} busy={busy === "force-reset"} disabled={role !== "SYS"} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  busy,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white disabled:opacity-50"
    >
      {icon}
      {busy ? "Processing..." : label}
    </button>
  );
}
