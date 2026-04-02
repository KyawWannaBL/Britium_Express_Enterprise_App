export type UserRole = 
  | 'RID' | 'WH' | 'DE' | 'MKT' | 'CUS' 
  | 'CS' | 'SUP' | 'OPS' | 'HR' | 'FIN' 
  | 'SYS' | 'BRM';

export const RolePermissions = {
  RID: { label: "Rider Portal", routes: ["/rider/scan", "/rider/delivery-list"] },
  WH:  { label: "Warehouse Portal", routes: ["/warehouse/inbound", "/warehouse/inventory"] },
  DE:  { label: "Data Entry", routes: ["/create-delivery"] },
  MKT: { label: "Marketing Console", routes: ["/marketing/campaigns", "/marketing/analytics"] },
  CUS: { label: "Customer Portal", routes: ["/customer/my-orders", "/customer/track"] },
  CS:  { label: "Customer Service", routes: ["/cs/tickets", "/way-management"] },
  SUP: { label: "Supervisor Hub", routes: ["/dashboard", "/way-management", "/staff-tracking"] },
  OPS: { label: "Operations Admin", routes: ["/dashboard", "/create-delivery", "/way-management"] },
  HR:  { label: "HR Console", routes: ["/hr/attendance", "/operator-management"] },
  FIN: { label: "Finance Portal", routes: ["/financial-reports"] },
  BRM: { label: "Branch Manager", routes: ["/dashboard", "/branch/reports", "/way-management"] },
  SYS: { label: "System Master", routes: ["*"] } // Full Access
};
