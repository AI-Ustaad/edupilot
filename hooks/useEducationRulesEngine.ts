// hooks/useEducationRulesEngine.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const useEducationRulesEngine = (action: string, payload: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["edu-rules", action, payload],
    queryFn: async () => {
      const res = await apiClient.post("/education/rules", { action, payload });
      return res.data?.data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
