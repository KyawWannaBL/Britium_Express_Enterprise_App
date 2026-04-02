"use client";

import { useState, useEffect, useRef } from 'react';

export default function BaggingConsolePage() {
  const [bags, setBags] = useState<any[]>([]);
  const [activeBagId, setActiveBagId] = useState<string>('');
  const [barcode, setBarcode] = useState('');
  const [newBagCode, setNewBagCode] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [scanMessage, setScanMessage] = useState({ text: '', type: '' });
  
  const scannerRef = useRef<HTMLInputElement>(null);

  const fetchBags = async () => {
    const res = await fetch('/api/v1/warehouse/bags');
    const json = await res.json();
    if (json.data) setBags(json.data);
  };

  useEffect(() => { fetchBags(); }, []);

  const handleCreateBag = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/warehouse/bags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_bag', bag_code: newBagCode, destination: newDestination })
    });
    setNewBagCode('');
    setNewDestination('');
    fetchBags();
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBagId) {
      setScanMessage({ text: 'Please select a Bag first!', type: 'error' });
      return;
    }

    const currentScan = barcode.trim();
    setBarcode('');

    try {
      const res = await fetch('/api/v1/warehouse/bags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan_to_bag', tracking_no: currentScan, bag_id: activeBagId })
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error);
      
      setScanMessage({ text: `✅ ${currentScan} added to bag!`, type: 'success' });
      fetchBags(); // Refresh counts
    } catch (err: any) {
      setScanMessage({ text: `❌ ${err.message}`, type: 'error' });
    } finally {
      scannerRef.current?.focus();
    }
  };

  const activeBag = bags.find(b => b.id === activeBagId);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">BAG & SACK MANAGEMENT / အိတ်စီမံခန့်ခွဲမှု</h1>
        <p className="text-sm text-slate-500">Group sorted parcels into dispatch-ready bags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Bag Scanner */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4">Scanner Console</h2>
          
          <select 
            className="w-full p-3 border-2 border-slate-200 rounded mb-6 font-bold text-slate-700 focus:border-blue-500 outline-none"
            value={activeBagId}
            onChange={(e) => setActiveBagId(e.target.value)}
          >
            <option value="">-- SELECT AN OPEN BAG --</option>
            {bags.map(b => (
              <option key={b.id} value={b.id}>{b.bag_code} (Target: {b.destination})</option>
            ))}
          </select>

          <form onSubmit={handleScan}>
            <input 
              ref={scannerRef}
              type="text" 
              className={`w-full text-center text-xl tracking-widest p-4 border-2 rounded-lg transition-colors ${activeBagId ? 'bg-blue-50 border-blue-200 focus:bg-white focus:border-blue-500' : 'bg-slate-100 border-slate-200 cursor-not-allowed'}`}
              placeholder={activeBagId ? "SCAN PARCEL TO ADD TO BAG..." : "SELECT A BAG FIRST"}
              value={barcode} 
              onChange={e => setBarcode(e.target.value)} 
              disabled={!activeBagId}
            />
            <button type="submit" className="hidden">Submit</button>
          </form>

          {scanMessage.text && (
            <div className={`mt-4 p-4 rounded text-center font-bold ${scanMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {scanMessage.text}
            </div>
          )}

          {activeBag && (
            <div className="mt-8 p-4 bg-slate-50 rounded border border-slate-200 text-center">
              <p className="text-sm text-slate-500 uppercase">Current Bag Capacity</p>
              <p className="text-4xl font-black text-slate-800">{activeBag.shipments?.[0]?.count || activeBag.shipments?.length || 0}</p>
              <p className="text-xs text-slate-400">Parcels inside {activeBag.bag_code}</p>
            </div>
          )}
        </div>

        {/* Create New Bag Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Create New Bag</h2>
          <form onSubmit={handleCreateBag} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">BAG BARCODE / ID *</label>
              <input required type="text" className="w-full p-2 border rounded bg-slate-50" placeholder="e.g. SACK-MDY-001" 
                value={newBagCode} onChange={e => setNewBagCode(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">DESTINATION HUB *</label>
              <input required type="text" className="w-full p-2 border rounded bg-slate-50" placeholder="e.g. Mandalay Main" 
                value={newDestination} onChange={e => setNewDestination(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded">
              OPEN NEW BAG
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
