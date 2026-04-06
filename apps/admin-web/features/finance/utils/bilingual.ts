import type { Bi, LanguageMode } from "@/features/finance/types/finance.types";

export const BI = (en: string, my: string): Bi => ({ en, my });

export const getBiText = (text: Bi, mode: LanguageMode) => {
  if (mode === "my") return text.my;
  if (mode === "both") return `${text.en} / ${text.my}`;
  return text.en;
};
