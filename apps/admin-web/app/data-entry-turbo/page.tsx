"use client";

import { useState, useEffect } from 'react';

export default function DataEntryTurboPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    tracking_no: '',
    recipient_name: '',
    weight_kg: '',
    cod_amount: '',
    delivery_fee: ''
  });

  // Fetch recent entries on load
  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/v1/shipments');
      const json = await res.json();
      if (json.data) setRecentEntries(json.data);
    } catch (err) {
      console.error("Failed to load recent entries");
    }
  };

  useEffect(() => { fetchRecent(); }, []);

  // Handle high-speed form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/v1/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to book shipment');

      setMessage(`✅ Success: ${formData.tracking_no} booked successfully.`);
      
      // Clear form for the next rapid-fire entry
      setFormData({ tracking_no: '', recipient_name: '', weight_kg: '', cod_amount: '', delivery_fee: '' });
      fetchRecent(); // Update the list instantly
      
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">DATA ENTRY TURBO / ဒေတာထည့်သွင်းမှုမြန်နှုန်း</h1>
        <p className="text-sm text-slate-500">High-speed booking, validation, and barcode-ready intake flow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rapid Form Panel */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-blue-600">+</span> Quick Booking
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TRACKING NO *</label>
                <input required type="text" className="w-full p-2 border rounded bg-slate-50 focus:bg-white" placeholder="e.g. BEX-99001" 
                  value={formData.tracking_no} onChange={e => setFormData({...formData, tracking_no: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">RECIPIENT NAME *</label>
                <input required type="text" className="w-full p-2 border rounded bg-slate-50 focus:bg-white" placeholder="Customer Name"
                  value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">WEIGHT (KG)</label>
                <input type="number" step="0.1" className="w-full p-2 border rounded bg-slate-50 focus:bg-white" placeholder="0.0"
                  value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">DELIVERY FEE (MMK)</label>
                <input type="number" className="w-full p-2 border rounded bg-slate-50 focus:bg-white" placeholder="0"
                  value={formData.delivery_fee} onChange={e => setFormData({...formData, delivery_fee: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">COD TO COLLECT (MMK)</label>
                <input type="number" className="w-full p-2 border rounded bg-slate-50 focus:bg-white" placeholder="0"
                  value={formData.cod_amount} onChange={e => setFormData({...formData, cod_amount: e.target.value})} />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded text-sm font-medium ${message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <button disabled={loading} type="submit" className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded transition-colors disabled:opacity-50">
              {loading ? 'BOOKING...' : 'CREATE ENTRY / စာရင်းသွင်းမည်'}
            </button>
          </form>
        </div>

        {/* Live Queue Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Recent Drafts</h2>
          {recentEntries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No recent entries found.</p>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <div>
                    <p className="font-bold text-sm">{entry.tracking_no}</p>
                    <p className="text-xs text-slate-500">{entry.recipient_name}</p>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">
                    {entry.current_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
