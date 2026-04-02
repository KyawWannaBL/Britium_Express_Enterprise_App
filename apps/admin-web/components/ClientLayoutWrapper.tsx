"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Strict check: Is the user on ANY auth page?
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    // Return JUST the children, absolutely no Sidebar
    return <main className="min-h-screen bg-[#0A192F] w-full">{children}</main>;
  }

  // Otherwise, return the Enterprise Dashboard layout
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
