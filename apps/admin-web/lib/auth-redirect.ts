export function resolveHomeByRole(appRole?: string | null) {
  const role = String(appRole || "").toUpperCase();

  if (["SUPER_ADMIN", "APP_OWNER", "SYS"].includes(role)) {
    return "/operator-management";
  }

  if (["OPERATIONS_ADMIN", "SUPERVISOR", "SUBSTATION_MANAGER", "WAREHOUSE_MANAGER"].includes(role)) {
    return "/way-management";
  }

  if (["FINANCE_USER", "FINANCE_STAFF"].includes(role)) {
    return "/financial-reports";
  }

  if (["CUSTOMER_SERVICE", "STAFF", "DATA_ENTRY", "MARKETING_ADMIN", "HR_ADMIN"].includes(role)) {
    return "/create-delivery";
  }

  return "/create-delivery";
}
