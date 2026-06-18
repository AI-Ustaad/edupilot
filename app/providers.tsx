"use client";

import { NextIntlClientProvider } from "next-intl";
import QueryProvider from "@/components/QueryProvider"; // 🚀 FIX: QueryProvider امپورٹ کیا گیا ہے

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
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {/* 🚀 FIX: پوری ایپ کو QueryProvider میں لپیٹ دیا گیا ہے */}
      <QueryProvider>
        {children}
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
