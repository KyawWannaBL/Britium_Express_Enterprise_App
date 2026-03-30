export function generateWayID(origin: string, destination: string, count: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const serial = String(count).padStart(4, '0');
  const start = origin.substring(0, 3).toUpperCase();
  const end = destination.substring(0, 3).toUpperCase();
  
  return `${start}${dateStr}${end}${serial}`;
}

export function generateSmartUserID(branchCode: string, role: string, count: number) {
  const officeMap: Record<string, string> = { 'YGN-HQ': 'H', 'YGN': 'Y', 'MDY': 'M', 'NPT': 'N' };
  const roleMap: Record<string, string> = { 
    'admin': 'SADM', 'rider_bike': 'RDB', 'rider_van': 'RDD', 'rider_moto': 'RDM', 'helper': 'RDH' 
  };

  const prefix = officeMap[branchCode] || officeMap[branchCode.substring(0, 3)] || 'X';
  const abbr = roleMap[role] || 'STFF';
  const serial = String(count).padStart(4, '0');

  return `${prefix}-${abbr}-${serial}`;
}

// 🚨 CRITICAL ALIAS: This fixes the "Export doesn't exist" build error in your API route
export const generateSmartWayId = generateWayID;