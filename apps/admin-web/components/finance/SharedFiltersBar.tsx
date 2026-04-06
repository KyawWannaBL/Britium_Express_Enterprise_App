"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { ActionButton } from "@/components/finance/controls/ActionButton";
import { SelectInput } from "@/components/finance/controls/SelectInput";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { TextInput } from "@/components/finance/controls/TextInput";

export function SharedFiltersBar() {
  const {
    filters,
    setFilters,
    branches,
    zones,
    activeModule,
    setModuleAsyncState,
  } = useFinancePortal();

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-5">
          <TextInput type="date" value={filters.dateFrom} onChange={(e) => setFilters({ dateFrom: e.target.value })} />
          <TextInput type="date" value={filters.dateTo} onChange={(e) => setFilters({ dateTo: e.target.value })} />
          <SelectInput value={filters.branch} onChange={(e) => setFilters({ branch: e.target.value })}>
            {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </SelectInput>
          <SelectInput value={filters.zone} onChange={(e) => setFilters({ zone: e.target.value })}>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </SelectInput>
          <TextInput value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} placeholder="Search..." />
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton tone="secondary" onClick={() => setModuleAsyncState(activeModule, "loading")}>Loading</ActionButton>
          <ActionButton tone="secondary" onClick={() => setModuleAsyncState(activeModule, "empty")}>Empty</ActionButton>
          <ActionButton tone="secondary" onClick={() => setModuleAsyncState(activeModule, "error")}>Error</ActionButton>
          <ActionButton onClick={() => setModuleAsyncState(activeModule, "ready")}>Ready</ActionButton>
        </div>
      </div>
    </SurfaceCard>
  );
}
