"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";

export function AccessDenied() {
  const { languageMode } = useFinancePortal();

  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-8 py-10">
      <div className="text-lg font-black text-amber-700">
        {getBiText(
          { en: "Access restricted by role-based policy", my: "RBAC မူဝါဒအရ အသုံးပြုခွင့်ကန့်သတ်ထားသည်" },
          languageMode
        )}
      </div>
    </div>
  );
}
