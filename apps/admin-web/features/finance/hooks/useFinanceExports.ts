"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { BI } from "@/features/finance/utils/bilingual";

export function useFinanceExports() {
  const { pushToast } = useFinancePortal();

  const exportReport = async (format: "csv" | "xlsx" | "pdf", payload: unknown, context: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${context}.${format}.json`;
    a.click();
    URL.revokeObjectURL(href);
    pushToast(BI("Export prepared", "export အဆင်သင့်ဖြစ်ပါပြီ"));
  };

  return { exportReport };
}
