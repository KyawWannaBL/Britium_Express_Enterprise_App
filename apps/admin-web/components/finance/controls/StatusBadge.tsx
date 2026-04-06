import type { Bi } from "@/features/finance/types/finance.types";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";

export function StatusBadge({
  text,
  tone = "blue",
}: {
  text: Bi;
  tone?: "blue" | "amber" | "green" | "rose" | "violet" | "slate";
}) {
  const { languageMode } = useFinancePortal();
  const palette = {
    blue: "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black ${palette}`}>
      {getBiText(text, languageMode)}
    </span>
  );
}
