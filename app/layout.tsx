import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { BrandingProvider } from "@/context/BrandingContext";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

const locales = ["en", "ur", "ar", "hi", "es", "fr", "zh"];

export const metadata: Metadata = {
  title: "EduPilot | AI-Powered School Management System",
  description: "All-in-one AI platform for modern educational institutions.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read locale from cookie (set by LanguageSwitcher or middleware)
  const cookieStore = cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const locale = locales.includes(localeCookie) ? localeCookie : "en";

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/en.json`)).default;
  }

  return (
    <html lang={locale}>
      <body className={font.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <BrandingProvider>
            {children}
          </BrandingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
