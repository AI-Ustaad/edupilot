// hooks/useClasses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext"; // آپ کا موجودہ AuthContext

// 🔄 Fetch All Classes
export const useClasses = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.classes(tenantId),
    queryFn: () => classService.getAllClasses(),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// ✨ Create Class Mutation (With Auto Invalidation)
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: (data: { classGrade: string; sectionName: string }) => 
      classService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes(tenantId) });
    },
  });
};

// 🗑️ Delete Class Mutation (With Optimistic Update)
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
    onMutate: async (deletedId: string) => {
      // 🚀 Optimistic Update: فوراً UI سے Remove کر دو
      await queryClient.cancelQueries({ queryKey: QueryKeys.classes(tenantId) });
      
      const previousClasses = queryClient.getQueryData(QueryKeys.classes(tenantId));
      
      queryClient.setQueryData(QueryKeys.classes(tenantId), (old: any[]) => {
        return old.filter((c: any) => c.id !== deletedId);
      });
      
      return { previousClasses };
    },
    onError: (err, _deletedId, context) => {
      // ❌ Fail ہونے پر Rollback کر دو
      queryClient.setQueryData(QueryKeys.classes(tenantId), context?.previousClasses);
    },
    onSettled: () => {
      // آخر میں Server سے Sync کر لو
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes(tenantId) });
    },
  });
};
