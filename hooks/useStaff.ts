// hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch All Staff
export const useStaff = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.staff(tenantId),
    queryFn: async () => {
      const response = await apiClient.get("/staff");
      return safeArray(response);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// 🗑️ Delete Staff Mutation
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/staff/${id}`);
    },
    onSuccess: () => {
      // جب سٹاف ڈیلیٹ ہو، تو Staff اور Dashboard کا Cache ریفریش ہو
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
