// hooks/useAnalytics.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject, safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch Super Admin Tenants List
export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await apiClient.get("/super-admin/tenants");
      return safeArray(res);
    },
  });
};

// 🔄 Fetch Analytics Data for a specific Tenant (or Global)
export const useAnalytics = (tenantId?: string, startDate?: string, endDate?: string) => {
  const { user } = useAuth();
  const currentTenantId = tenantId || user?.tenantId || "unknown";

  return useQuery({
    queryKey: [QueryKeys.analytics(currentTenantId), { startDate, endDate }],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await apiClient.get("/super-admin/analytics", { params });
      return safeObject(res);
    },
    enabled: !!currentTenantId,
  });
};
