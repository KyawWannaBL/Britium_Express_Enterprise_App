'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
  Download,
  UserPlus,
  UserCog,
  Lock,
  Inbox,
  XCircle,
  Fingerprint,
  Database,
  Globe2
} from "lucide-react";

// Mocking the internal store logic for a standalone completed file
import {
  DEFAULT_ROLES,
  PERMISSIONS,
  STORAGE_KEY,
  type Account,
  type Role,
  loadStore,
  saveStore,
  roleIsPrivileged,
  safeLower,
  getAccountByEmail,
  activeGrantsFor,
  canApplyAuthorityDirect,
  grantDirect,
  revokeDirect,
  requestAuthorityChange,
  pushAudit
} from "@/lib/accountControlStore";

type View = "ACCOUNTS" | "AUTH_REQUESTS" | "AUDIT";
type UiLang = "en" | "my";

/** * REUSABLE COMPONENTS 
 */
function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}

function Modal({ open, title, onClose, children, widthClass, subtitle }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`relative w-full ${widthClass ?? "max-w-3xl"} rounded-[2.5rem] bg-[#05080F] ring-1 ring-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div>
            <div className="text-white font-black uppercase italic text-xl tracking-tight">{title}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-sky-500 font-mono mt-1">{subtitle}</div>
          </div>
          <Button variant="ghost" className="text-slate-500 hover:text-white rounded-full h-12 w-12" onClick={onClose}><XCircle /></Button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">{children}</div>
      </motion.div>
    </div>
  );
}

/** * MAIN MODULE 
 */
export default function AccountControlBilingual() {
  const [lang, setLang] = useState<UiLang>("my");
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [store, setStore] = useState(() => loadStore());
  const [view, setView] = useState<View>("ACCOUNTS");
  const [q, setQ] = useState("");
  const [modalAuthorityEmail, setModalAuthorityEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const actorEmail = "admin@britiumexpress.com"; // Context fallback
  const actor = useMemo(() => getAccountByEmail(store.accounts, actorEmail), [store.accounts]);

  useEffect(() => saveStore(store), [store]);

  // --- ACTIONS ---
  const updateProfile = (email: string, name: string, empId: string, role: Role) => {
    setStore(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => safeLower(a.email) === safeLower(email) ? { ...a, name, employeeId: empId, role } : a)
    }));
    setToast({ type: "ok", msg: t("Profile updated.", "ပရိုဖိုင် ပြင်ဆင်ပြီးပါပြီ။") });
  };

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return store.accounts.filter(a => a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s));
  }, [store.accounts, q]);

  /** * AUTHORITY & IDENTITY MODAL 
   */
  const ManagementModal = ({ email }: { email: string }) => {
    const subject = getAccountByEmail(store.accounts, email);
    const [editName, setEditName] = useState(subject?.name || "");
    const [editEmpId, setEditEmpId] = useState(subject?.employeeId || "");
    const [editRole, setEditRole] = useState<Role>(subject?.role || "STAFF");

    if (!subject) return null;

    const subjectPerms = new Set(activeGrantsFor(store.grants, subject.email).map(g => g.permission));
    const direct = canApplyAuthorityDirect(store, actor);

    return (
      <div className="space-y-8">
        {/* STEP 1: IDENTITY */}
        <section className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs italic">
            <Fingerprint size={16} /> {t("Step 1: Identity Governance", "အဆင့် ၁။ ကိုယ်ရေးအချက်အလက် စီမံခန့်ခွဲမှု")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{t("Full Name", "အမည်အပြည့်အစုံ")}</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="h-12 w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 text-sm text-white outline-none focus:ring-2 ring-emerald-500/40" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{t("Employee ID", "ဝန်ထမ်းနံပါတ်")}</label>
              <input value={editEmpId} onChange={e => setEditEmpId(e.target.value)} className="h-12 w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 text-sm text-white outline-none focus:ring-2 ring-emerald-500/40" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{t("Global Role", "ရာထူး")}</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value as Role)} className="h-12 w-full rounded-2xl bg-[#0B101B] border border-white/10 px-4 text-sm text-white outline-none">
                {DEFAULT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase h-11 px-8 rounded-xl shadow-lg shadow-emerald-900/20" onClick={() => updateProfile(email, editName, editEmpId, editRole)}>
              {t("Save Changes", "အချက်အလက်သိမ်းမည်")}
            </Button>
          </div>
        </section>

        {/* STEP 2: AUTHORITIES */}
        <section className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-sky-400 font-black uppercase tracking-widest text-xs italic">
            <ShieldCheck size={16} /> {t("Step 2: Access Authorities", "အဆင့် ၂။ လုပ်ပိုင်ခွင့် ခွင့်ပြုချက်များ")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERMISSIONS.map(p => {
              const enabled = subjectPerms.has(p.code);
              return (
                <div key={String(p.code)} className={`p-4 rounded-2xl border transition-all ${enabled ? 'border-sky-500/40 bg-sky-500/5' : 'border-white/5 bg-black/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{lang === 'en' ? p.en : p.mm}</div>
                      <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">{String(p.code)}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={enabled} 
                        className="sr-only peer"
                        onChange={e => {
                          const want = e.target.checked;
                          setStore(prev => direct 
                            ? (want ? grantDirect(prev, actorEmail, email, p.code) : revokeDirect(prev, actorEmail, email, p.code))
                            : requestAuthorityChange(prev, actorEmail, email, want ? "GRANT" : "REVOKE", p.code)
                          );
                          setToast({ type: "ok", msg: t("Policy Updated", "ခွင့်ပြုချက် ပြောင်းလဲပြီး") });
                        }}
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B101B] p-6 lg:p-12 text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER CONTROL BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#05080F] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-sky-500/10 rounded-[1.5rem] flex items-center justify-center text-sky-500 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{t("Account Control", "အကောင့်ထိန်းချုပ်မှု")}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Pill className="bg-sky-500/10 text-sky-400">{t("Secure Node Active", "လုံခြုံရေးစနစ် အလုပ်လုပ်နေသည်")}</Pill>
                <div className="text-xs text-slate-500 font-mono italic">{actorEmail}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* LANGUAGE TOGGLE */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button onClick={() => setLang("en")} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${lang === 'en' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setLang("my")} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${lang === 'my' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>မြန်မာ</button>
            </div>
            
            <nav className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <Button variant="ghost" onClick={() => setView("ACCOUNTS")} className={`rounded-xl h-10 px-4 text-xs font-black uppercase ${view === "ACCOUNTS" ? "bg-white/5 text-sky-400" : "text-slate-500"}`}>{t("Accounts", "အကောင့်များ")}</Button>
              <Button variant="ghost" onClick={() => setView("AUDIT")} className={`rounded-xl h-10 px-4 text-xs font-black uppercase ${view === "AUDIT" ? "bg-white/5 text-sky-400" : "text-slate-500"}`}>{t("Audit", "မှတ်တမ်း")}</Button>
            </nav>
          </div>
        </header>

        {/* TOAST SYSTEM */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm ${toast.type === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {toast.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN DIRECTORY VIEW */}
        {view === "ACCOUNTS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  value={q} onChange={e => setQ(e.target.value)} 
                  className="w-full h-14 bg-[#05080F] border border-white/5 rounded-2xl pl-12 pr-6 text-white outline-none focus:ring-2 ring-sky-500/20" 
                  placeholder={t("Search name or email...", "အမည် (သို့) Email ဖြင့်ရှာဖွေရန်...")} 
                />
              </div>
              <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl h-14 px-8 font-black uppercase text-xs">
                <UserPlus className="mr-2 h-4 w-4" /> {t("Add User", "အကောင့်အသစ်")}
              </Button>
            </div>

            <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                  <tr>
                    <th className="p-8">{t("Personnel Info", "ဝန်ထမ်းအချက်အလက်")}</th>
                    <th className="p-8">{t("Access Level", "ရာထူးအဆင့်")}</th>
                    <th className="p-8">{t("Network Status", "အခြေအနေ")}</th>
                    <th className="p-8 text-right">{t("Governance", "စီမံခန့်ခွဲမှု")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(acc => (
                    <tr key={acc.email} className="group hover:bg-white/[0.01] transition-all">
                      <td className="p-8">
                        <div className="text-white font-black uppercase italic tracking-tight">{acc.name}</div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">{acc.email}</div>
                        <div className="flex gap-2 mt-3">
                           <Pill className="bg-white/5 text-slate-400">{acc.department || "-"}</Pill>
                           <Pill className="bg-white/5 text-slate-400">ID: {acc.employeeId || "N/A"}</Pill>
                        </div>
                      </td>
                      <td className="p-8">
                        <Pill className="bg-sky-500/10 text-sky-400">{acc.role}</Pill>
                        <div className="mt-3 text-[10px] text-slate-600 font-mono uppercase tracking-widest flex items-center gap-2">
                           <Database size={10} /> {activeGrantsFor(store.grants, acc.email).length} {t("Active Policies", "ခွင့်ပြုချက်များ")}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${acc.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                          <span className={`text-[11px] font-black uppercase italic ${acc.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>{acc.status}</span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <Button variant="ghost" className="rounded-xl h-11 px-4 text-slate-500 hover:text-white hover:bg-white/5" onClick={() => setModalAuthorityEmail(acc.email)}>
                          <ShieldCheck size={18} className="mr-2" /> {t("Manage", "စီမံရန်")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* AUDIT VIEW */}
        {view === "AUDIT" && (
           <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 text-center space-y-4">
              <History size={48} className="mx-auto text-slate-700" />
              <div className="text-xl font-black text-slate-400 uppercase italic">{t("Immutable Audit Trail", "ပြင်ဆင်၍မရသော မှတ်တမ်းများ")}</div>
              <div className="text-sm text-slate-600 max-w-md mx-auto">{t("Access restricted to encrypted system logs only.", "စနစ်၏ လျှို့ဝှက်မှတ်တမ်းများကိုသာ ကြည့်ရှုခွင့်ရှိသည်။")}</div>
           </Card>
        )}
      </div>

      {/* MANAGE MODAL */}
      <Modal 
        open={!!modalAuthorityEmail} 
        title={t("Identity & Authority Governance", "အသုံးပြုသူနှင့် လုပ်ပိုင်ခွင့် စီမံခန့်ခွဲမှု")} 
        subtitle="enterprise_identity_governance"
        onClose={() => setModalAuthorityEmail(null)} 
        widthClass="max-w-5xl"
      >
        {modalAuthorityEmail ? <ManagementModal email={modalAuthorityEmail} /> : null}
      </Modal>

    </div>
  );
}