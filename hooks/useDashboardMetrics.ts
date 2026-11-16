// hooks/useDashboardMetrics.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const clientDate = typeof window !== "undefined" ? new Date().toISOString().slice(0, 10) : "";

  return useQuery({
    queryKey: [...QueryKeys.dashboard(tenantId), clientDate],
    queryFn: async () => {
      const url = clientDate ? `/dashboard?date=${clientDate}` : "/dashboard";
      return safeObject(await apiClient.get(url));
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
