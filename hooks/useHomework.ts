// hooks/useHomework.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useHomework = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["homework", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/homework")),
  });
};

export const useCreateHomework = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/homework", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["homework", tenantId] }),
  });
};
