// hooks/useParents.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch Parent Dashboard Data (Children List with Metrics)
export const useParentDashboard = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["parents", tenantId, "dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/parents/dashboard");
      return safeArray(res); // Expects array of children with stats
    },
    enabled: !!tenantId && tenantId !== "unknown" && user?.role === 'parent',
  });
};
