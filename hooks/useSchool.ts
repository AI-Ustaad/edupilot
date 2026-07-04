// hooks/useSchool.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useSchool = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["school", tenantId],
    queryFn: async () => safeObject(await apiClient.get("/settings")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
