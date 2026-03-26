
"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoleMeta } from "../../lib/roles";

type Operator = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string | null;
  phone_e164: string | null;
  role: string;
  app_role: string | null;
  preferred_language: "en" | "my";
  primary_branch_id?: string | null;
  primary_branch_code: string | null;
  must_change_password: boolean;
  is_active: boolean;
};

type Branch = {
  id: string;
  code: string;
  name_en: string;
  name_my: string;
  city: string;
  township: string;
};

type Membership = {
  id?: string;
  branchId: string;
  branchCode: string;
  role: "admin" | "dispatcher" | "ops" | "finance" | "branch_manager";
  isPrimary: boolean;
};

type AuditItem = {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_name: string | null;
  target_name: string | null;
};

const APP_ROLES = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
  "FINANCE_USER",
  "FINANCE_STAFF",
  "MARKETING_ADMIN",
  "HR_ADMIN",
  "CUSTOMER_SERVICE",
  "SUPERVISOR",
  "WAREHOUSE_MANAGER",
  "SUBSTATION_MANAGER",
  "STAFF",
  "DATA_ENTRY",
  "RIDER",
  "DRIVER",
  "HELPER",
  "MERCHANT",
  "CUSTOMER"
];

const BRANCH_ROLES: Membership["role"][] = ["admin", "dispatcher", "ops", "finance", "branch_manager"];

const INITIAL_FORM = {
  email: "",
  password: "P@ssw0rd1",
  fullName: "",
  phone: "",
  appRole: "STAFF",
  preferredLanguage: "en",
  primaryBranchId: "",
  primaryBranchCode: ""
};

function branchDisplay(branch: Branch) {
  return `${branch.code} · ${branch.name_en}`;
}

export default function OperatorManagementConsole() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [membershipsSaving, setMembershipsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [selectedMemberships, setSelectedMemberships] = useState<Membership[]>([]);
  const [actionResult, setActionResult] = useState("");
  const [auditFilter, setAuditFilter] = useState("");

  async function loadData(targetOperatorId?: string | null) {
    setLoading(true);
    setMessage("");
    try {
      const [operatorRes, auditRes] = await Promise.all([
        fetch("/api/admin/operators", { credentials: "include" }),
        fetch(`/api/admin/operators/audit${targetOperatorId ? `?operatorId=${targetOperatorId}` : ""}`, { credentials: "include" })
      ]);
      const payload = await operatorRes.json();
      const auditPayload = await auditRes.json();
      if (!operatorRes.ok) throw new Error(payload.error ?? "Failed to load operators.");
      if (!auditRes.ok) throw new Error(auditPayload.error ?? "Failed to load operator audit logs.");
      setOperators(payload.operators ?? []);
      setBranches(payload.branches ?? []);
      setAuditLogs(auditPayload.logs ?? []);
      if (!selectedOperatorId && payload.operators?.length) {
        setSelectedOperatorId(payload.operators[0].id);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load operators.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMemberships(operatorId: string) {
    try {
      const response = await fetch(`/api/admin/operators/${operatorId}/memberships`, { credentials: "include" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to load branch memberships.");
      setSelectedMemberships(payload.memberships ?? []);
    } catch (error) {
      setActionResult(error instanceof Error ? error.message : "Failed to load memberships.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (selectedOperatorId) {
      void loadMemberships(selectedOperatorId);
      void loadData(selectedOperatorId);
    }
  }, [selectedOperatorId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return operators;
    return operators.filter((item) =>
      [item.full_name, item.email ?? "", item.app_role ?? "", item.primary_branch_code ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [operators, search]);

  const selectedOperator = useMemo(
    () => operators.find((item) => item.id === selectedOperatorId) ?? null,
    [operators, selectedOperatorId]
  );

  const filteredAuditLogs = useMemo(() => {
    const q = auditFilter.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter((item) =>
      [item.action, item.actor_name ?? "", item.target_name ?? "", JSON.stringify(item.metadata ?? {})]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [auditFilter, auditLogs]);

  const metrics = useMemo(() => ({
    active: operators.filter((item) => item.is_active).length,
    mustChange: operators.filter((item) => item.must_change_password).length,
    superAdmins: operators.filter((item) => item.app_role === "SUPER_ADMIN").length
  }), [operators]);

  function handleBranchChange(branchId: string) {
    const branch = branches.find((item) => item.id === branchId);
    setForm((current) => ({
      ...current,
      primaryBranchId: branchId,
      primaryBranchCode: branch?.code ?? ""
    }));
  }

  async function handleCreate() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to create operator.");
      setForm(INITIAL_FORM);
      setMessage(`Created operator: ${payload.operator.full_name}`);
      setSelectedOperatorId(payload.operator.id);
      await loadData(payload.operator.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create operator.");
    } finally {
      setSaving(false);
    }
  }

  async function patchOperator(operatorId: string, body: Record<string, unknown>) {
    setActionResult("");
    const response = await fetch(`/api/admin/operators/${operatorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed to update operator.");
    await loadData(operatorId);
  }

  async function saveMemberships() {
    if (!selectedOperator) return;
    setMembershipsSaving(true);
    setActionResult("");
    try {
      const response = await fetch(`/api/admin/operators/${selectedOperator.id}/memberships`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          appRole: selectedOperator.app_role ?? selectedOperator.role,
          memberships: selectedMemberships
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save memberships.");
      setActionResult("Branch memberships saved.");
      await loadData(selectedOperator.id);
    } catch (error) {
      setActionResult(error instanceof Error ? error.message : "Failed to save memberships.");
    } finally {
      setMembershipsSaving(false);
    }
  }

  function updateMembership(index: number, patch: Partial<Membership>) {
    setSelectedMemberships((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item;
        const next = { ...item, ...patch };
        if (patch.branchId) {
          const branch = branches.find((entry) => entry.id === patch.branchId);
          next.branchCode = branch?.code ?? next.branchCode;
        }
        return next;
      }).map((item, idx, all) => ({
        ...item,
        isPrimary: patch.isPrimary && idx === index ? true : patch.isPrimary ? idx === index : item.isPrimary
      }))
    );
  }

  function addMembership() {
    const fallbackBranch = branches[0];
    if (!fallbackBranch) return;
    setSelectedMemberships((current) => [
      ...current,
      {
        branchId: fallbackBranch.id,
        branchCode: fallbackBranch.code,
        role: "ops",
        isPrimary: current.length === 0
      }
    ]);
  }

  function removeMembership(index: number) {
    setSelectedMemberships((current) => {
      const next = current.filter((_, idx) => idx !== index);
      if (next.length === 1) next[0].isPrimary = true;
      if (!next.some((item) => item.isPrimary) && next.length) next[0].isPrimary = true;
      return next;
    });
  }

  async function triggerEmailAction(action: "invite" | "reset") {
    if (!selectedOperator) return;
    setActionResult("");
    try {
      const response = await fetch(`/api/admin/operators/${selectedOperator.id}/email-actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          redirectTo: `${window.location.origin}/auth/must-change-password`
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `Failed to ${action}.`);
      const actionLink = payload?.result?.properties?.action_link || payload?.result?.action_link;
      setActionResult(
        action === "invite"
          ? `Invite workflow triggered for ${selectedOperator.email ?? selectedOperator.full_name}.`
          : `Reset workflow generated${actionLink ? `: ${actionLink}` : "."}`
      );
      await loadData(selectedOperator.id);
    } catch (error) {
      setActionResult(error instanceof Error ? error.message : `Failed to ${action}.`);
    }
  }

  return (
    <div className="stack-lg">
      <div className="stats-grid">
        <article className="metric">
          <div className="metric-label">Active operators</div>
          <div className="metric-value">{metrics.active}</div>
          <div className="metric-meta">Current enabled users across branches</div>
        </article>
        <article className="metric">
          <div className="metric-label">Must change password</div>
          <div className="metric-value">{metrics.mustChange}</div>
          <div className="metric-meta">Starter-password users pending first secure login</div>
        </article>
        <article className="metric">
          <div className="metric-label">Super admins</div>
          <div className="metric-value">{metrics.superAdmins}</div>
          <div className="metric-meta">Top-level authority accounts in circulation</div>
        </article>
      </div>

      {message ? <div className="alert-banner">{message}</div> : null}
      {actionResult ? <div className="alert-banner" style={{ background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.25)" }}>{actionResult}</div> : null}

      <div className="page-grid">
        <div className="page-main">
          <section className="panel">
            <div className="section-header">
              <div>
                <div className="kicker">Operator onboarding</div>
                <h3 style={{ marginTop: 10 }}>Create staff account</h3>
              </div>
            </div>

            <div className="form-grid form-grid-3">
              <label className="field">
                <span>Full name / အမည်</span>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Aye Aye Thu" />
              </label>
              <label className="field">
                <span>Email</span>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@britiumexpress.com" />
              </label>
              <label className="field">
                <span>Mobile / ဖုန်း</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+959123456789" />
              </label>
              <label className="field">
                <span>Temporary password</span>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              <label className="field">
                <span>App role</span>
                <select value={form.appRole} onChange={(e) => setForm({ ...form, appRole: e.target.value })}>
                  {APP_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Language</span>
                <select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as "en" | "my" })}>
                  <option value="en">English</option>
                  <option value="my">Myanmar</option>
                </select>
              </label>
              <label className="field">
                <span>Primary branch</span>
                <select value={form.primaryBranchId} onChange={(e) => handleBranchChange(e.target.value)}>
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branchDisplay(branch)}</option>
                  ))}
                </select>
              </label>
              <div className="field">
                <span>Branch code</span>
                <div className="readonly-field">{form.primaryBranchCode || "Auto-filled from branch"}</div>
              </div>
              <div className="field">
                <span>Role level</span>
                <div className="readonly-field">{getRoleMeta(form.appRole)?.level ?? "L1"} · {getRoleMeta(form.appRole)?.scope ?? "S1"}</div>
              </div>
            </div>

            <div className="action-row" style={{ marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => void handleCreate()} disabled={saving}>
                {saving ? "Creating..." : "Create operator"}
              </button>
              <span className="badge">Must-change-password enabled automatically</span>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 24 }}>
            <div className="section-header">
              <div>
                <div className="kicker">Directory</div>
                <h3 style={{ marginTop: 10 }}>Operator access roster</h3>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Operator</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Password policy</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="muted">Loading operators...</td></tr>
                  ) : filtered.map((operator) => (
                    <tr key={operator.id} style={selectedOperatorId === operator.id ? { background: "rgba(37,99,235,0.08)" } : undefined}>
                      <td>
                        <button className="linkish" onClick={() => setSelectedOperatorId(operator.id)}>{operator.full_name}</button>
                        <div className="muted">{operator.email ?? operator.phone_e164 ?? operator.auth_user_id}</div>
                      </td>
                      <td>
                        <div>{operator.app_role ?? operator.role}</div>
                        <div className="muted">{getRoleMeta(operator.app_role)?.level ?? "L1"} · {getRoleMeta(operator.app_role)?.scope ?? "S1"}</div>
                      </td>
                      <td>{operator.primary_branch_code ?? "Unassigned"}</td>
                      <td>{operator.must_change_password ? "Must change now" : "Password compliant"}</td>
                      <td>{operator.is_active ? "Active" : "Suspended"}</td>
                      <td>
                        <div className="action-row wrap">
                          <button className="btn btn-secondary btn-small" onClick={() => setSelectedOperatorId(operator.id)}>Manage</button>
                          <button className="btn btn-secondary btn-small" onClick={() => void patchOperator(operator.id, { action: "force_password_reset", legacyProfileId: operator.id })}>Force reset</button>
                          <button className="btn btn-secondary btn-small" onClick={() => void patchOperator(operator.id, { action: "toggle_status", isActive: !operator.is_active })}>
                            {operator.is_active ? "Suspend" : "Activate"}
                          </button>
                          <select className="inline-select" value={operator.app_role ?? "STAFF"} onChange={(e) => void patchOperator(operator.id, { action: "change_role", appRole: e.target.value })}>
                            {APP_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 ? (
                    <tr><td colSpan={6} className="muted">No operators found.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="page-side">
          <section className="panel">
            <div className="kicker">Search</div>
            <h3 style={{ marginTop: 10 }}>Find an operator</h3>
            <label className="field" style={{ marginTop: 16 }}>
              <span>Search by name, email, branch, or role</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search operator..." />
            </label>
          </section>

          <section className="panel">
            <div className="kicker">Selected operator</div>
            <h3 style={{ marginTop: 10 }}>{selectedOperator?.full_name ?? "Choose an operator"}</h3>
            {selectedOperator ? (
              <div className="stack" style={{ marginTop: 16 }}>
                <div className="ledger-row">
                  <div>
                    <strong>{selectedOperator.app_role ?? selectedOperator.role}</strong>
                    <div className="muted">{selectedOperator.email ?? selectedOperator.phone_e164 ?? selectedOperator.auth_user_id}</div>
                  </div>
                  <span className="badge">{selectedOperator.primary_branch_code ?? "No branch"}</span>
                </div>
                <div className="action-row wrap">
                  <button className="btn btn-secondary btn-small" onClick={() => void triggerEmailAction("invite")}>Send invite email</button>
                  <button className="btn btn-secondary btn-small" onClick={() => void triggerEmailAction("reset")}>Send reset email</button>
                </div>
              </div>
            ) : <div className="muted" style={{ marginTop: 14 }}>Select an operator to edit memberships and audit activity.</div>}
          </section>

          <section className="panel">
            <div className="kicker">Branch readiness</div>
            <h3 style={{ marginTop: 10 }}>Active branches</h3>
            <div className="stack">
              {branches.slice(0, 6).map((branch) => (
                <div key={branch.id} className="ledger-row">
                  <div>
                    <strong>{branch.code}</strong>
                    <div className="muted">{branch.name_en} / {branch.name_my}</div>
                  </div>
                  <span className="badge">{branch.city}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <div className="kicker">Access scope</div>
            <h3 style={{ marginTop: 10 }}>Branch membership editor</h3>
          </div>
          <div className="action-row">
            <button className="btn btn-secondary" onClick={addMembership} disabled={!selectedOperator}>Add branch</button>
            <button className="btn btn-primary" onClick={() => void saveMemberships()} disabled={!selectedOperator || membershipsSaving}>
              {membershipsSaving ? "Saving..." : "Save memberships"}
            </button>
          </div>
        </div>

        {!selectedOperator ? (
          <div className="muted">Select an operator from the roster above.</div>
        ) : (
          <div className="stack">
            {selectedMemberships.map((membership, index) => (
              <div key={`${membership.branchId}-${index}`} className="form-grid form-grid-4">
                <label className="field">
                  <span>Branch</span>
                  <select value={membership.branchId} onChange={(e) => updateMembership(index, { branchId: e.target.value })}>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branchDisplay(branch)}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Branch role</span>
                  <select value={membership.role} onChange={(e) => updateMembership(index, { role: e.target.value as Membership["role"] })}>
                    {BRANCH_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Primary scope</span>
                  <select value={membership.isPrimary ? "yes" : "no"} onChange={(e) => updateMembership(index, { isPrimary: e.target.value === "yes" })}>
                    <option value="yes">Primary</option>
                    <option value="no">Secondary</option>
                  </select>
                </label>
                <div className="field">
                  <span>Actions</span>
                  <div className="action-row">
                    <button className="btn btn-secondary btn-small" onClick={() => removeMembership(index)}>Remove</button>
                    <span className="badge">{membership.branchCode}</span>
                  </div>
                </div>
              </div>
            ))}
            {!selectedMemberships.length ? <div className="muted">No memberships yet. Add at least one branch.</div> : null}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <div className="kicker">Audit intelligence</div>
            <h3 style={{ marginTop: 10 }}>Operator admin audit log</h3>
          </div>
          <label className="field" style={{ minWidth: 280 }}>
            <span>Filter audit events</span>
            <input value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} placeholder="search actions, actor, metadata..." />
          </label>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>{item.action}</td>
                  <td>{item.actor_name ?? "System"}</td>
                  <td>{item.target_name ?? "-"}</td>
                  <td><code style={{ fontSize: 12 }}>{JSON.stringify(item.metadata ?? {})}</code></td>
                </tr>
              ))}
              {filteredAuditLogs.length === 0 ? (
                <tr><td colSpan={5} className="muted">No audit events found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
