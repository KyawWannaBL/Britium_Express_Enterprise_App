"use client";

import { financeNavigation } from "@/features/finance/constants/navigation";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { useFinancePermissions } from "@/features/finance/hooks/useFinancePermissions";

export function FinanceSidebar() {
  const { activeModule, setActiveModule, languageMode } = useFinancePortal();
  const { has } = useFinancePermissions();

  return (
    <SurfaceCard className="p-3">
      {financeNavigation.map((group) => (
        <div key={group.heading.en} className="mb-5">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            {getBiText(group.heading, languageMode)}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const locked = !has(item.permission);
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={locked}
                  onClick={() => setActiveModule(item.key)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    activeModule === item.key ? "bg-[#0d2c54] text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{getBiText(item.label, languageMode)}</span>
                  {locked ? <span>🔒</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </SurfaceCard>
  );
}
