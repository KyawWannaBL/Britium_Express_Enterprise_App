import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "Britium Express Enterprise",
  description: "Enterprise Logistics Console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* The wrapper decides whether to show the Sidebar or not based on the URL */}
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
