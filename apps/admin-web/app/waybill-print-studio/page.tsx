"use client";

import { useState, useEffect } from 'react';

export default function WaybillPrintStudioPage() {
  const [waybills, setWaybills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [printing, setPrinting] = useState(false);

  const fetchWaybills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/waybills');
      const json = await res.json();
      if (json.data) setWaybills(json.data);
    } catch (err) {
      console.error("Failed to fetch waybills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWaybills(); }, []);

  const toggleSelect = (tracking: string) => {
    setSelected(prev => prev.includes(tracking) ? prev.filter(t => t !== tracking) : [...prev, tracking]);
  };

  const handlePrint = () => {
    if (selected.length === 0) return alert("Select at least one waybill to print.");
    
    // Switch to Print Mode layout
    setPrinting(true);
    
    // Wait a split second for React to render the print layout, then trigger browser print
    setTimeout(() => {
      window.print();
      
      // When the user closes the print dialog, return to normal mode
      setPrinting(false);
    }, 500);
  };

  // --- PRINT ONLY LAYOUT ---
  // This layout only appears when the 'printing' state is true.
  if (printing) {
     return (
       <div className="p-8 bg-white min-h-screen text-black">
         {waybills.filter(w => selected.includes(w.tracking_no)).map(w => (
           <div key={w.tracking_no} className="border-4 border-black p-6 mb-8 rounded-xl break-inside-avoid">
             <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-4">
               <div>
                 <h1 className="text-4xl font-black italic tracking-tighter">BRITIUM EXPRESS</h1>
                 <p className="text-xs font-bold uppercase tracking-widest mt-1">Official Waybill / Dispatch Record</p>
               </div>
               <div className="text-right">
                 <p className="font-mono text-3xl font-bold">{w.tracking_no}</p>
                 {/* Visual Barcode Simulator */}
                 <div className="flex gap-[2px] h-12 mt-2 w-56 bg-black ml-auto" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px, transparent 4px, transparent 8px, white 8px, white 10px)'}}></div>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-8 text-xl">
               <div>
                 <p className="text-sm font-bold text-gray-500 uppercase mb-1">Deliver To:</p>
                 <p className="font-black text-3xl">{w.recipient_name}</p>
                 <p className="mt-2 text-gray-700">{w.address || 'Address registered in system'}</p>
                 <p className="mt-2 font-bold text-gray-700">Phone: {w.phone_1 || 'Registered on file'}</p>
               </div>
               <div className="text-right flex flex-col justify-end">
                 <p className="text-sm font-bold text-gray-500 uppercase mb-1">Collect Amount (COD):</p>
                 <p className="font-black text-5xl">{w.cod_amount?.toLocaleString() || 0} <span className="text-2xl">MMK</span></p>
               </div>
             </div>
           </div>
         ))}
       </div>
     );
  }

  // --- STANDARD DASHBOARD LAYOUT ---
  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">WAYBILL PRINT STUDIO / ဝေးဘေလ်ပုံနှိပ်ခန်း</h1>
          <p className="text-sm text-slate-500">Print labels, manifests, and barcode-ready waybills.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchWaybills} className="bg-white border border-slate-200 text-slate-700 font-bold py-2 px-4 rounded hover:bg-slate-50 transition-colors">
            REFRESH
          </button>
          <button onClick={handlePrint} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            PRINT SELECTED ({selected.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"></path></svg></div>
          <div><p className="text-xs font-bold text-slate-400">STATUS</p><p className="font-bold text-slate-700">Online</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></div>
          <div><p className="text-xs font-bold text-slate-400">QUEUE</p><p className="font-bold text-slate-700">{selected.length} Pending</p></div>
        </div>
      </div>

      {/* Database Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 w-16">
                <input type="checkbox" onChange={(e) => {
                  if (e.target.checked) setSelected(waybills.map(w => w.tracking_no));
                  else setSelected([]);
                }} checked={selected.length === waybills.length && waybills.length > 0} />
              </th>
              <th className="px-6 py-4">Tracking No.</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Current Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading print queue...</td></tr>
            ) : waybills.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No shipments found.</td></tr>
            ) : (
              waybills.map((w) => (
                <tr key={w.id} className={`border-b transition-colors ${selected.includes(w.tracking_no) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selected.includes(w.tracking_no)} onChange={() => toggleSelect(w.tracking_no)} />
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">{w.tracking_no}</td>
                  <td className="px-6 py-4">{w.recipient_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                      {w.current_status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
