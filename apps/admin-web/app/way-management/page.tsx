"use client";

import { useState, useEffect } from 'react';

export default function WayManagementPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ active: 0, success: 0, failures: 0, returns: 0, all_ways: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Statuses');

  const fetchWays = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ways');
      const json = await res.json();
      if (json.data) {
        setShipments(json.data);
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch way data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWays(); }, []);

  // Simple filter logic for the table
  const filteredShipments = shipments.filter(s => 
    filter === 'All Statuses' || s.current_status.toLowerCase() === filter.toLowerCase().replace(' ', '_')
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">WAY MANAGEMENT / ကုန်စည်စီမံခန့်ခွဲမှု</h1>
        <p className="text-sm text-slate-500">Chain of custody, dispatch routing, status control, and proof-of-delivery review.</p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-xl shadow-sm text-white relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">All Ways / စုစုပေါင်း</p>
          <p className="text-4xl font-black">{metrics.all_ways}</p>
          <span className="absolute top-4 right-4 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">ACTIVE</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            Success <span className="text-green-500">✓</span>
          </p>
          <p className="text-4xl font-black text-slate-800">{metrics.success}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            Failures <span className="text-red-500">✕</span>
          </p>
          <p className="text-4xl font-black text-slate-800">{metrics.failures}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            Returns <span className="text-yellow-500">↺</span>
          </p>
          <p className="text-4xl font-black text-slate-800">{metrics.returns}</p>
        </div>
      </div>

      {/* Control Bar & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex gap-4">
            <select 
              className="p-2 border rounded text-sm outline-none focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Out For Delivery</option>
              <option>Delivered</option>
              <option>Exception</option>
            </select>
          </div>
          <button onClick={fetchWays} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            REFRESH
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Tracking</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Collectable</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Syncing with network...</td></tr>
              ) : filteredShipments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No shipment records found matching criteria.</td></tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-700">{shipment.tracking_no}</td>
                    <td className="px-6 py-4">{shipment.recipient_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                        ${shipment.current_status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          shipment.current_status.includes('failed') ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {shipment.current_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{shipment.cod_amount?.toLocaleString() || 0} MMK</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline text-xs font-bold">Details</button>
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
