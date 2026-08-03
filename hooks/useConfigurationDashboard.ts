import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

const key = (tenantId?: string) => ["configurationDashboard", tenantId];

export function useConfigurationDashboard() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: key(tenantId),
    queryFn: async () => {
      const res = await apiClient.get("/configuration/dashboard");
      return safeObject(res);
    },
    enabled: !!tenantId && tenantId !== "unknown",
    staleTime: 60_000,
  });
}