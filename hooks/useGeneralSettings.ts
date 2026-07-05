// hooks/useGeneralSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

export const useGeneralSettings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["generalSettings", user?.tenantId],
    queryFn: async () => safeObject(await apiClient.get("/settings/general")),
    enabled: !!user?.tenantId,
  });
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: async (data: any) => apiClient.put("/settings/general", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generalSettings", user?.tenantId] });
      showToast("General settings updated successfully!", "success");
    },
    onError: () => showToast("Failed to update settings.", "error"),
  });
};
