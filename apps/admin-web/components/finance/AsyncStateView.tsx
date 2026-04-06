"use client";

import React from "react";
import type { AsyncState } from "@/features/finance/types/finance.types";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { ActionButton } from "@/components/finance/controls/ActionButton";

export function AsyncStateView({
  state,
  onRetry,
  children,
}: {
  state: AsyncState;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const { languageMode } = useFinancePortal();

  if (state === "loading") {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-8 py-12 text-center">
        {getBiText({ en: "Loading finance workspace...", my: "Finance workspace ကို တင်နေသည်..." }, languageMode)}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-8 py-12 text-center">
        {getBiText(
          { en: "No records matched your current filters", my: "လက်ရှိ filter များနှင့် ကိုက်ညီသောမှတ်တမ်းမတွေ့ရှိပါ" },
          languageMode
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-8 py-12 text-center">
        <div className="text-lg font-black text-rose-700">
          {getBiText({ en: "Unable to load this module", my: "ဤ module ကို မတင်နိုင်ပါ" }, languageMode)}
        </div>
        <div className="mt-4">
          <ActionButton onClick={onRetry}>Retry</ActionButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
