import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server"; // 👈 getMessages بھی امپورٹ کریں
import { NextIntlClientProvider } from "next-intl"; // 👈 یہ Provider ضروری ہے

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
  // سرور سے زبان اور میسجز حاصل کریں
  const locale = await getLocale();
  const messages = await getMessages(); // 👈 یہ فائلز کا ڈیٹا اٹھائے گا

  return (
    <html lang={locale} dir={["ur", "ar"].includes(locale) ? "rtl" : "ltr"}>
      <body className={font.className}>
        {/* 👈 پوری ایپ کو اس کے اندر ریپ کریں تاکہ translation کام کرے */}
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
