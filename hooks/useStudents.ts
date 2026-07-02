// hooks/useStudents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch All Students (Can filter by class/section)
export const useStudents = (params?: { classGrade?: string; section?: string }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: [...QueryKeys.students(tenantId), params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params as any).toString();
      const url = `/students${queryString ? `?${queryString}` : ""}`;
      const response = await apiClient.get(url);
      return safeArray(response);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// 🗑️ Delete Student Mutation (With Cache Invalidation)
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/students/${id}`);
    },
    onSuccess: () => {
      // جب سٹوڈنٹ ڈیلیٹ ہو، تو Students اور Dashboard کا Cache ریفریش ہو
      queryClient.invalidateQueries({ queryKey: QueryKeys.students(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
