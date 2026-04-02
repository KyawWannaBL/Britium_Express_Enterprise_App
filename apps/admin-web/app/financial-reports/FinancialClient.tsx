"use client";

import dynamic from 'next/dynamic';

// We use relative pathing to ensure the file is found regardless of alias config
const FinancialDashboardUI = dynamic(() => import('../../components/FinancialDashboardUI'), {
  ssr: false,
  loading: () => (
    <div className="p-20 text-center">
      <div className="animate-spin inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-slate-400 font-mono text-xs">REESTABLISHING COMMAND LINK...</p>
    </div>
  )
});

export default function FinancialClient({ data }: { data: any }) {
  return <FinancialDashboardUI data={data} />;
}
