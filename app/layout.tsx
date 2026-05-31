import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

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
  // سرور سے زبان (locale) اور ٹرانسلیشن کی فائل (messages) حاصل کریں
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={["ur", "ar"].includes(locale) ? "rtl" : "ltr"}>
      <body className={font.className}>
        {/* Next.js 14 میں locale پراپرٹی کا پاس ہونا لازمی ہے ورنہ کیز (Keys) نظر آئیں گی */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
