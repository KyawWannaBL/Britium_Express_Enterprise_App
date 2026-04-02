"use client";

import { useState, useEffect, useRef } from 'react';

export default function WarehousePortalPage() {
  const [stats, setStats] = useState({ inbound: 0, sorting: 0, dispatch: 0, exceptions: 0 });
  const [barcode, setBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScan, setLastScan] = useState<{ tracking: string, status: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/warehouse/scans');
      const json = await res.json();
      if (json.data) setStats(json.data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  useEffect(() => { 
    fetchStats(); 
    inputRef.current?.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isProcessing) return;

    setIsProcessing(true);
    const currentScan = barcode.trim();
    setBarcode('');

    try {
      const res = await fetch('/api/v1/warehouse/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_no: currentScan, scan_type: 'inbound' })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Scan failed');

      setLastScan({ tracking: currentScan, status: 'SUCCESS' });
      fetchStats(); // Update the big numbers instantly
    } catch (err: any) {
      setLastScan({ tracking: currentScan, status: 'ERROR' });
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">WAREHOUSE HUB / ဂိုဒေါင်စီမံခန့်ခွဲမှု</h1>
        <p className="text-sm text-slate-500">Inbound receiving, sorting, scan verification, and exception handling.</p>
      </div>

      {/* The Big Number Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Inbound Pending</p>
          <p className="text-4xl font-black text-slate-800">{stats.inbound}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">In Warehouse (Sorted)</p>
          <p className="text-4xl font-black text-blue-600">{stats.sorting}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Dispatch Ready</p>
          <p className="text-4xl font-black text-green-600">{stats.dispatch}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Exceptions</p>
          <p className="text-4xl font-black text-red-600">{stats.exceptions}</p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-blue-600">↓</span> Inbound Scan (Receive to Warehouse)
          </h2>
          <form onSubmit={handleScan}>
            <input 
              ref={inputRef}
              type="text" 
              className="w-full text-center text-xl tracking-widest p-4 border-2 border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors mb-4" 
              placeholder="SCAN PARCEL BARCODE..."
              value={barcode} 
              onChange={e => setBarcode(e.target.value)} 
              disabled={isProcessing}
            />
            <button type="submit" disabled={isProcessing} className="w-full bg-slate-800 text-white font-bold py-3 rounded opacity-0 absolute pointer-events-none">
              Hidden Submit for Scanner
            </button>
          </form>

          {lastScan && (
            <div className={`mt-4 p-4 rounded text-center font-bold ${lastScan.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {lastScan.status === 'SUCCESS' ? `✅ ${lastScan.tracking} received into Warehouse` : `❌ Error processing ${lastScan.tracking}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
