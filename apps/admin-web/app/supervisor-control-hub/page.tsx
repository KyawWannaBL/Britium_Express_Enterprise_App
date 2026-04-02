"use client";

import { useState, useEffect } from 'react';

export default function SupervisorControlHubPage() {
  const [metrics, setMetrics] = useState({
    team_performance: 0,
    pending_approvals: 0,
    shift_attendance: 0,
    escalation_queue: 0,
    route_balancing: 0,
    daily_target: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/v1/supervisor/dashboard');
      const json = await res.json();
      if (json.data) setMetrics(json.data);
    } catch (err) {
      console.error("Failed to load supervisor metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SUPERVISOR CONTROL HUB / ကြီးကြပ်ရေးထိန်းချုပ်မှု</h1>
          <p className="text-sm text-slate-500 mt-1">Team oversight, escalation handling, and live performance monitoring.</p>
        </div>
        <button onClick={fetchDashboard} className="text-sm bg-white border border-slate-200 px-4 py-2 rounded shadow-sm font-bold hover:bg-slate-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          SYNC TELEMETRY
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Row 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <h2 className="text-xs font-bold uppercase tracking-wider">Active Staff</h2>
          </div>
          <p className="text-4xl font-black text-slate-800">{loading ? '-' : metrics.team_performance}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            <h2 className="text-xs font-bold uppercase tracking-wider">Pending Approvals</h2>
          </div>
          <p className="text-4xl font-black text-slate-800">{loading ? '-' : metrics.pending_approvals}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h2 className="text-xs font-bold uppercase tracking-wider">Shift & Attendance</h2>
          </div>
          <p className="text-4xl font-black text-slate-800">{loading ? '-' : `${metrics.shift_attendance}%`}</p>
        </div>

        {/* Row 2 */}
        <div className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${metrics.escalation_queue > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
          <div className={`flex items-center gap-3 mb-4 ${metrics.escalation_queue > 0 ? 'text-red-500' : 'text-slate-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-xs font-bold uppercase tracking-wider">Escalation Queue</h2>
          </div>
          <p className={`text-4xl font-black ${metrics.escalation_queue > 0 ? 'text-red-700' : 'text-slate-800'}`}>
            {loading ? '-' : metrics.escalation_queue}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <h2 className="text-xs font-bold uppercase tracking-wider">Active Routes</h2>
          </div>
          <p className="text-4xl font-black text-slate-800">{loading ? '-' : metrics.route_balancing}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 text-white transition-all hover:shadow-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 text-blue-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <h2 className="text-xs font-bold uppercase tracking-wider">Daily Success Target</h2>
          </div>
          <p className="text-4xl font-black text-white">{loading ? '-' : `${metrics.daily_target}%`}</p>
          
          {/* Progress Bar Background */}
          <div className="absolute bottom-0 left-0 h-2 bg-slate-800 w-full">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${metrics.daily_target}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
