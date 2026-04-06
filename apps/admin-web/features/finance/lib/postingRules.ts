import type { PeriodState } from "@/features/finance/types/finance.types";

export const isLockedPeriod = (dateValue: string, periods: PeriodState[]) => {
  const month = dateValue.slice(0, 7);
  return periods.some((period) => period.month === month && period.closed);
};
