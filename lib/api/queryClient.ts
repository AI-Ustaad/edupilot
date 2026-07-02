// lib/api/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 منٹ
      gcTime: 1000 * 60 * 30, // 30 منٹ (Garbage Collection Time)
      retry: 2, // Failure کی صورت میں 2 دفعا Retry
      retryDelay: 1000, // 1 سیکنڈ کا Delay
      refetchOnReconnect: true, // انٹرنیٹ واپس آن پر Auto Refresh
      refetchOnMount: false, // Component Mount ہونے پر بار بار Fetch نہیں ہوگا
      refetchOnWindowFocus: false, // Tab Switch پر Fetch نہیں ہوگا
    },
  },
});
