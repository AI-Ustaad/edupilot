import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ClientAuthWrapper } from "@/components/ClientAuthWrapper";
import { BrandingProvider } from "@/context/BrandingContext"; // 👈 نیا

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduPilot | AI-Powered School Management System",
  description: "All-in-one AI platform for modern educational institutions.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={font.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientAuthWrapper>
            <BrandingProvider>
              {children}
            </BrandingProvider>
          </ClientAuthWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
