import OperatorManagementClient from "./OperatorManagementClient";

export default function OperatorManagementPage() {
  return (
    <div className="max-w-7xl mx-auto p-6" style={{ fontFamily: "'Pyidaungsu', 'Noto Sans Myanmar', sans-serif" }}>
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
          Network <span className="text-blue-500 not-italic font-light">Personnel</span>
        </h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
          HR Management & Authority Control / ဝန်ထမ်းစီမံခန့်ခွဲမှု
        </p>
      </div>
      <OperatorManagementClient />
    </div>
  );
}
