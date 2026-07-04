// hooks/useDashboardMetrics.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.dashboard(tenantId),
    queryFn: async () => safeObject(await apiClient.get("/dashboard")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
