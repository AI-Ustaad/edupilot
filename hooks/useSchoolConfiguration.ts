// hooks/useSchoolConfiguration.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import type { SchoolConfigurationInput } from "@/types/school-configuration";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import type { ConfigurationHistoryViewModel } from "@/types/viewmodels/configuration-history.viewmodel";

const key = (tenantId?: string) => ["schoolConfigurationViewModel", tenantId];

export function useSchoolConfiguration() {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(user?.tenantId),
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      const payload = res.data?.data ?? res.data;
      return {
        configuration: payload?.configuration as SchoolConfigurationViewModel | undefined,
        history: (payload?.history || []) as ConfigurationHistoryViewModel[]
      };
    },
    enabled: Boolean(user?.tenantId),
    staleTime: 60_000,
  });
}

export function useSaveSchoolConfiguration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: (input: SchoolConfigurationInput) => 
      apiClient.post("/settings/school-configuration", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(user?.tenantId) });
      queryClient.invalidateQueries({ queryKey: ["enterprise-runtime-config"] }); // Refresh Runtime
      showToast("School configuration published successfully.", "success");
    },
    onError: () => showToast("Unable to save school configuration.", "error"),
  });
}
