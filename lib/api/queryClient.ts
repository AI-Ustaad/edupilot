// lib/api/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 منٹ
      gcTime: 1000 * 60 * 30, // 30 منٹ (Garbage Collection Time)
      retry: 2,
      retryDelay: 1000,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});
