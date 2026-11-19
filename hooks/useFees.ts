// hooks/useFees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch Fees by Month, Class & Section
export const useFees = (month: string, classGrade: string, section: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["fees", tenantId, month, classGrade, section],
    queryFn: async () => {
      if (!month) return [];
      const res = await apiClient.get("/fees", { params: { month, classGrade, section, limit: 100 } });
      return safeArray(res);
    },
    enabled: !!tenantId && !!month,
  });
};

// ✨ Save Fee (Server-authoritative refetch)
export const useSaveFee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/fees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees", tenantId] });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};

// 🗑️ Delete Fee Record
export const useDeleteFee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/fees?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees", tenantId] });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
