// hooks/useFees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch Fees by Month & Class
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

// ✨ Save Fee (With Optimistic Update)
export const useSaveFee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/fees", data);
    },
    onMutate: async (newFee) => {
      const queryKey = QueryKeys.fees(tenantId, newFee.feeMonth, newFee.classGrade);
      await queryClient.cancelQueries({ queryKey });

      const previousFees = queryClient.getQueryData(queryKey);

      // 🚀 Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any[] = []) => {
        const existingIndex = old.findIndex((f: any) => f.studentId === newFee.studentId && f.feeMonth === newFee.feeMonth);
        if (existingIndex > -1) {
          const updated = [...old];
          updated[existingIndex] = { ...updated[existingIndex], ...newFee };
          return updated;
        }
        return [...old, { id: `temp-${Date.now()}`, ...newFee }];
      });

      return { previousFees, queryKey };
    },
    onError: (err, newFee, context) => {
      // Rollback on error
      if (context?.previousFees && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousFees);
      }
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
