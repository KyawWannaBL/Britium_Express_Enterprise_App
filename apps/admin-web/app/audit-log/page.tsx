export default function AuditLogPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">AUDIT LOG / စစ်ဆေးမှတ်တမ်း</h1>
        <p className="text-sm text-slate-500">System-wide security and tracking logs.</p>
      </div>
      <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
        <p className="text-slate-500">Audit logs are currently initializing...</p>
      </div>
    </div>
  );
}
