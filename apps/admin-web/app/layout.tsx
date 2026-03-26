import "./globals.css";
import AdminChrome from "./_components/AdminChrome";
import { LanguageProvider } from "@/lib/i18n";

export const metadata = {
  title: "Britium Express Enterprise",
  description: "Britium Express Delivery operations console"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AdminChrome>{children}</AdminChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
