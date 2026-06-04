// components/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // ہم اسے useState میں رکھ رہے ہیں تاکہ ہر رینڈر پر نیا کلائنٹ نہ بنے
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 منٹ تک ڈیٹا کیش (Cache) رہے گا، بار بار API کال نہیں ہوگی
        refetchOnWindowFocus: false, // ونڈو پر واپس آنے پر بلاوجہ لوڈنگ نہیں ہوگی
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
