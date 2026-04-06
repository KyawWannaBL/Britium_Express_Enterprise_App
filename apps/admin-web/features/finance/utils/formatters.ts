export const formatMoney = (value: number) => `${Number(value || 0).toLocaleString()} Ks`;
export const formatNumber = (value: number) => Number(value || 0).toLocaleString();
export const formatDate = (value: string) => value || "-";
