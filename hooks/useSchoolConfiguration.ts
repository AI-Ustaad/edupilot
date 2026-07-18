// hooks/useSchoolConfiguration.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import type { SchoolConfigurationInput } from "@/types/school-configuration";
import type { MasterSchoolConfiguration } from "@/types/configuration";

const key = (tenantId?: string) => ["schoolConfiguration", tenantId];

export function useSchoolConfiguration() {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(user?.tenantId),
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      
      // 🚀 FIX: Safely unwrap the API response (res.data.data.configuration)
      const payload = res.data?.data ?? res.data;
      return payload?.configuration as MasterSchoolConfiguration | undefined;
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
    // 🚀 FIX: Using POST instead of PUT to match our API route
    mutationFn: (input: SchoolConfigurationInput) => 
      apiClient.post("/settings/school-configuration", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(user?.tenantId) });
      queryClient.invalidateQueries({ queryKey: ["school", user?.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["generalSettings", user?.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["classes", user?.tenantId] });
      showToast("School configuration saved successfully.", "success");
    },
    onError: () => showToast("Unable to save school configuration.", "error"),
  });
}
