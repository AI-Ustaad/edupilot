"use client";
import { NextIntlClientProvider } from "next-intl";

export default function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}) {
  // FIXED: QueryProvider ہٹا دیا — ClientWrapper میں پہلے سے ہے
  // دو QueryProvider ہونے سے cache conflict ہوتا تھا
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
