// hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useSettings = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["settings", tenantId],
    queryFn: async () => safeObject(await apiClient.get("/settings")),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (data: any) => apiClient.put("/settings", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", tenantId] }),
  });
};
