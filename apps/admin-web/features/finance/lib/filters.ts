import type {
  CODRecord,
  FraudAlert,
  SharedFilters,
  UserAccount,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

export const inScope = (user: UserAccount, branch: string, zone: string) => {
  const branchOk = user.branches.includes("*") || user.branches.includes(branch);
  const zoneOk = user.zones.includes("*") || user.zones.includes(zone);
  return branchOk && zoneOk;
};

export const applyVoucherFilters = (
  vouchers: VoucherRecord[],
  filters: SharedFilters,
  user: UserAccount
) =>
  vouchers.filter((voucher) => {
    if (!inScope(user, voucher.branch, voucher.zone)) return false;
    const branchOk = filters.branch === "All Branches" || voucher.branch === filters.branch;
    const zoneOk = filters.zone === "All Zones" || voucher.zone === filters.zone;
    const query = filters.search.toLowerCase();
    const searchOk =
      !query ||
      voucher.voucherNo.toLowerCase().includes(query) ||
      voucher.referenceNo.toLowerCase().includes(query) ||
      voucher.creatorName.toLowerCase().includes(query) ||
      voucher.merchant.toLowerCase().includes(query);
    return branchOk && zoneOk && searchOk;
  });

export const applyCODFilters = (
  rows: CODRecord[],
  filters: SharedFilters,
  user: UserAccount
) =>
  rows.filter((row) => {
    if (!inScope(user, row.branch, row.zone)) return false;
    const branchOk = filters.branch === "All Branches" || row.branch === filters.branch;
    const zoneOk = filters.zone === "All Zones" || row.zone === filters.zone;
    const query = filters.search.toLowerCase();
    const searchOk =
      !query ||
      row.deliveryman.toLowerCase().includes(query) ||
      row.branch.toLowerCase().includes(query) ||
      row.zone.toLowerCase().includes(query);
    return branchOk && zoneOk && searchOk;
  });

export const applyFraudFilters = (
  rows: FraudAlert[],
  filters: SharedFilters,
  user: UserAccount
) =>
  rows.filter((row) => {
    if (!inScope(user, row.branch, row.zone)) return false;
    const branchOk = filters.branch === "All Branches" || row.branch === filters.branch;
    const zoneOk = filters.zone === "All Zones" || row.zone === filters.zone;
    return branchOk && zoneOk;
  });
