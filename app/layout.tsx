import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import ClientWrapper from "./ClientWrapper"; // 🔥 یہ سب سے اہم لائن ہے جو مسنگ تھی!

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
  const locale = await getLocale();
  let messages;
  
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Messages not found for locale:", locale);
    messages = {}; // Fallback in case of error
  }

  return (
    <html lang={locale} dir={["ur", "ar"].includes(locale) ? "rtl" : "ltr"}>
      <body className={font.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* 🔥 ClientWrapper کا ہونا لازمی ہے ورنہ لاڈنگ سپنر کبھی ختم نہیں ہوگا */}
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
