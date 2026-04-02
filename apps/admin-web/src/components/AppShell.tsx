import React from 'react';
// 1. CHANGE THIS IMPORT (Use Next.js Link instead of React Router)
import Link from 'next/link'; 
import { useAuth } from '../auth/AuthProvider';

export default function AppShell() {
  const { userRole } = useAuth();
  const role = userRole?.toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-[#0d2c54] text-white p-6">
        <h1 className="text-[#ffd700] font-bold text-xl mb-8">BRITIUM EXPRESS</h1>
        
        <nav className="space-y-4">
          <Link href="/" className="block hover:text-[#ffd700]">Overview</Link>
          
          {/* 2. MATCH THE FOLDER NAMES IN YOUR SCREENSHOT */}
          {(role === 'SYS' || role === 'FIN') && (
            <Link href="/financial-reports" className="block p-2 bg-white/5 rounded hover:bg-white/10">
                Financial Reports
            </Link>
          )}
          
          {(role === 'SYS' || role === 'MER') && (
            <Link href="/create-delivery" className="block p-2 bg-white/5 rounded hover:bg-white/10">
                Create Delivery
            </Link>
          )}

          {role === 'SYS' && (
            <Link href="/operator-management" className="block p-2 border border-[#ffd700] text-[#ffd700] rounded text-center">
                Operator Management
            </Link>
          )}
        </nav>
      </div>

      <div className="flex-1">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <span className="text-sm font-medium">Authority: <b className="text-blue-600">{userRole || 'Guest'}</b></span>
        </header>
        <main>
          {/* In Next.js, we don't use <Outlet />. The children are passed automatically. */}
        </main>
      </div>
    </div>
  );
}