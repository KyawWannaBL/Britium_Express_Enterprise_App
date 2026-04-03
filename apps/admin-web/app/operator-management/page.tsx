"use client";

import { useState, useEffect } from 'react';

export default function OperatorManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/staff');
      const json = await res.json();
      if (json.data) {
        setStaff(json.data);
        setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load staff directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAction = async (id: string, action: string, newRole?: string) => {
    if (action === 'block' && !confirm("Are you sure you want to revoke this user's system access?")) return;
    
    setProcessingId(id);
    try {
      await fetch('/api/v1/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, newRole })
      });
      await fetchStaff(); // Refresh the list
    } catch (err) {
      console.error("Failed to update user status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">OPERATOR MANAGEMENT / ဝန်ထမ်းစီမံခန့်ခွဲမှု</h1>
          <p className="text-sm text-slate-500">Set user roles, approve sign-ups, and manage security blocks.</p>
        </div>
        <button onClick={fetchStaff} className="bg-slate-800 text-white text-sm font-bold py-2 px-4 rounded hover:bg-slate-900 transition-colors">
          REFRESH DIRECTORY
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1">TOTAL STAFF</p>
          <p className="text-3xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-1 text-green-600">ACTIVE USERS</p>
          <p className="text-3xl font-black text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200 bg-yellow-50">
          <p className="text-xs font-bold text-yellow-600 mb-1">PENDING APPROVAL</p>
          <p className="text-3xl font-black text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 bg-red-50">
          <p className="text-xs font-bold text-red-500 mb-1">BLOCKED ACCESS</p>
          <p className="text-3xl font-black text-red-600">{stats.blocked}</p>
        </div>
      </div>

      {/* Security Directory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Employee Details</th>
              <th className="px-6 py-4">System Role</th>
              <th className="px-6 py-4">Account Status</th>
              <th className="px-6 py-4 text-right">Security Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading directory...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No staff found.</td></tr>
            ) : (
              staff.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{user.full_name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      disabled={processingId === user.id}
                      className="border border-slate-200 rounded p-1 text-xs font-bold uppercase outline-none focus:border-blue-500"
                      value={user.role}
                      onChange={(e) => handleAction(user.id, 'change_role', e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="rider">Rider</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                      ${user.status === 'active' ? 'bg-green-100 text-green-700' : 
                        user.status === 'blocked' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {user.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {user.status === 'pending_approval' && (
                      <button 
                        onClick={() => handleAction(user.id, 'approve')}
                        disabled={processingId === user.id}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded"
                      >
                        APPROVE
                      </button>
                    )}
                    {user.status === 'active' && user.role !== 'admin' && (
                      <button 
                        onClick={() => handleAction(user.id, 'block')}
                        disabled={processingId === user.id}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold py-1 px-3 rounded"
                      >
                        BLOCK
                      </button>
                    )}
                    {user.status === 'blocked' && (
                      <button 
                        onClick={() => handleAction(user.id, 'unblock')}
                        disabled={processingId === user.id}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1 px-3 rounded"
                      >
                        UNBLOCK
                      </button>
                    )}
                    <button className="text-blue-500 hover:text-blue-700 text-xs font-bold underline ml-2">
                      Reset Pass
                    </button>
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
