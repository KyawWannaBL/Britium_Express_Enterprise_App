import type { Bi } from "@/features/finance/types/finance.types";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";

export function MetricCard({
  label,
  value,
}: {
  label: Bi;
  value: string;
}) {
  const { languageMode } = useFinancePortal();

  return (
    <SurfaceCard className="p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        {getBiText(label, languageMode)}
      </div>
      <div className="mt-3 text-2xl font-black text-[#0d2c54]">{value}</div>
    </SurfaceCard>
  );
}
