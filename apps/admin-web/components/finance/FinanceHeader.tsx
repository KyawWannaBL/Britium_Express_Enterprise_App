"use client";

import { PORTAL_TITLE } from "@/features/finance/constants/labels";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { ActionButton } from "@/components/finance/controls/ActionButton";
import { SelectInput } from "@/components/finance/controls/SelectInput";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";

export function FinanceHeader() {
  const {
    languageMode,
    setLanguageMode,
    users,
    currentUser,
    activeUserId,
    setActiveUserId,
  } = useFinancePortal();

  return (
    <SurfaceCard className="p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
            {getBiText(PORTAL_TITLE, languageMode)}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {currentUser?.name} • {currentUser?.role}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              User Context
            </div>
            <SelectInput value={activeUserId} onChange={(e) => setActiveUserId(e.target.value)}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} • {user.role}
                </option>
              ))}
            </SelectInput>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Language Mode
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton tone={languageMode === "en" ? "primary" : "secondary"} onClick={() => setLanguageMode("en")}>EN</ActionButton>
              <ActionButton tone={languageMode === "my" ? "primary" : "secondary"} onClick={() => setLanguageMode("my")}>မြန်မာ</ActionButton>
              <ActionButton tone={languageMode === "both" ? "primary" : "secondary"} onClick={() => setLanguageMode("both")}>EN + မြန်မာ</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
