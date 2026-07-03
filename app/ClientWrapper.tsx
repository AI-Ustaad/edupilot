"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ToastProvider"; // 🚀 Toast Provider Import

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // 🚀 FIX: TanStack Query کے کلائنٹ کو انیشلائز (Initialize) کیا گیا ہے
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // ڈیٹا کو 1 منٹ تک کیش (Cache) رکھے گا
        refetchOnWindowFocus: false, // بار بار خواہ مخواہ ریفریش نہیں کرے گا
      },
    },
  }));

  return (
    // 🚀 FIX: پوری ایپ کو QueryClientProvider میں لپیٹ دیا گیا ہے
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 🚀 Toast Provider لپیٹ دیا گیا ہے */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
