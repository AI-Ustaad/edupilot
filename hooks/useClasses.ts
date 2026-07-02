// hooks/useClasses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";

// 🔄 Fetch All Classes
export const useClasses = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.classes,
    queryFn: async () => {
      const response = await apiClient.get("/classes");
      return safeArray(response);
    },
    enabled,
  });
};

// ✨ Create Class Mutation (With Auto Invalidation)
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { classGrade: string; sectionName: string }) => {
      return apiClient.post("/classes", data);
    },
    onSuccess: () => {
      // جب نیا کلاس بنیں گا، تو صرف Classes کا Cache ریفریش ہوگا
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes });
    },
  });
};

// 🗑️ Delete Class Mutation (With Optimistic Update)
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/classes?id=${id}`);
    },
    onMutate: async (deletedId: string) => {
      // 🚀 Optimistic Update: فوراً UI سے Remove کر دو
      await queryClient.cancelQueries({ queryKey: QueryKeys.classes });
      
      const previousClasses = queryClient.getQueryData(QueryKeys.classes);
      
      queryClient.setQueryData(QueryKeys.classes, (old: any[]) => {
        return old.filter((c: any) => c.id !== deletedId);
      });
      
      return { previousClasses };
    },
    onError: (err, _deletedId, context) => {
      // ❌ Fail ہونے پر Rollback کر دو
      queryClient.setQueryData(QueryKeys.classes, context?.previousClasses);
    },
    onSettled: () => {
      // آخر میں Server سے Sync کر لو
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes });
    },
  });
};
