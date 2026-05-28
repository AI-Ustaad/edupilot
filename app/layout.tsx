import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getLocale } from "next-intl/server";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduPilot | AI-Powered School Management System",
  description: "All-in-one AI platform for modern educational institutions.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // سرور سے موجودہ زبان حاصل کریں
  const locale = await getLocale();

  return (
    // 👈 یہاں ہم نے RTL اور LTR کا خودکار فیصلہ کیا ہے
    <html lang={locale} dir={["ur", "ar"].includes(locale) ? "rtl" : "ltr"}>
      <body className={font.className}>
        {children}
      </body>
    </html>
  );
}
