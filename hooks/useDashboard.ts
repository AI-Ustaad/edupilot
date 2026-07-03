// hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject, safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch Dashboard Metrics
export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.dashboard(tenantId),
    queryFn: async () => {
      const res = await apiClient.get("/dashboard");
      return safeObject(res);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// ⚠️ Fetch At-Risk Students
export const useRiskStudents = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["students", tenantId, "risk"],
    queryFn: async () => {
      const res = await apiClient.get("/students/risk");
      return safeArray(res);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
