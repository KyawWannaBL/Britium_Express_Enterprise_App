"use client";

import React from "react";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
