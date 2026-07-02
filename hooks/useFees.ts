// hooks/useFees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

export const useFees = (month: string, classGrade: string, section: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.fees(tenantId, month, classGrade),
    queryFn: async () => {
      if (!month) return [];
      const res = await apiClient.get("/fees", { params: { month, classGrade, section } });
      return safeArray(res);
    },
    enabled: !!tenantId && !!month,
  });
};

export const useSaveFee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/fees", data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.fees(tenantId, variables.feeMonth, variables.classGrade)
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};

export const useDeleteFee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/fees?id=${id}`);
    },
    onSuccess: () => {
      // چونکہ ہم بالکل exact params نہیں جانتے، اس لیے سارے Fees کا Cache ریفریش کر دو
      queryClient.invalidateQueries({ queryKey: ["fees", tenantId] });
    },
  });
};
