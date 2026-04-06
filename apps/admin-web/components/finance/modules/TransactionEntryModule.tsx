"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { SectionTitle } from "@/components/finance/controls/SectionTitle";

export function TransactionEntryModule() {
  const { languageMode } = useFinancePortal();

  return (
    <div className="space-y-4">
      <SectionTitle
        title={getBiText({ en: "Transaction Entry Workflows", my: "transaction ထည့်သွင်းခြင်း workflow" }, languageMode)}
        subtitle={getBiText({ en: "Simple, journal, and cash voucher entry", my: "simple၊ journal နှင့် cash voucher entry" }, languageMode)}
      />
      <SurfaceCard>
        <p className="text-sm text-slate-600">
          {getBiText(
            {
              en: "Scaffold created and compatible with the current finance portal page structure.",
              my: "လက်ရှိ finance portal page structure နှင့် ကိုက်ညီသော scaffold ကို ဖန်တီးပြီးဖြစ်သည်။",
            },
            languageMode
          )}
        </p>
      </SurfaceCard>
    </div>
  );
}
