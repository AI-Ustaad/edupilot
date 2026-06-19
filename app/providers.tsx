"use client";

import { NextIntlClientProvider } from "next-intl";
// ❌ یہاں سے QueryProvider ہٹا دیا گیا ہے تاکہ ڈپلیکیٹ نہ ہو۔ یہ اب صرف ClientWrapper میں چلے گا۔

export default function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
