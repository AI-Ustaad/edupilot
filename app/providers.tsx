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
  return (
    // 🚀 FIX: یہاں سے ہم نے QueryProvider ہٹا دیا ہے تاکہ وہ ClientWrapper کے ساتھ clash نہ کرے
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
