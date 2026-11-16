// hooks/useClasses.ts
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { logger } from "@/lib/logger/logger";
import { extractUniqueClasses } from "@/lib/utils/formatClassLabel";

export { extractUniqueClasses };

// 🔄 Fetch All Classes
export const useClasses = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.classes(tenantId),
    queryFn: async () => {
      const res = await apiClient.get("/classes");
      return safeArray(res);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// 🎯 Fetch Unique Classes (Deduplicated 1..10 in natural order)
export const useUniqueClasses = () => {
  const query = useClasses();
  const uniqueClasses = useMemo(() => extractUniqueClasses(query.data), [query.data]);
  return {
    ...query,
    uniqueClasses,
  };
};

// ✨ Create Class (With Optimistic Update)
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: { classGrade: string; sectionName: string }) => {
      return apiClient.post("/classes", data);
    },
    onMutate: async (newClass) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.classes(tenantId) });
      const previousClasses = queryClient.getQueryData(QueryKeys.classes(tenantId));
      
      // Optimistically add to UI
      queryClient.setQueryData(QueryKeys.classes(tenantId), (old: any[]) => [
        ...old, 
        { id: `temp-${Date.now()}`, classGrade: newClass.classGrade, sectionName: newClass.sectionName }
      ]);
      
      return { previousClasses };
    },
    onError: (err, newClass, context) => {
      // Rollback on error
      queryClient.setQueryData(QueryKeys.classes(tenantId), context?.previousClasses);
    },
    onSettled: () => {
      // Sync with server at the end
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes(tenantId) });
    },
  });
};

// ✏️ Update Section / Assign Teacher
export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: { id: string; classTeacherId?: string | null; classTeacherName?: string; incharge?: string }) => {
      return apiClient.put("/classes", data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes(tenantId) });
    },
  });
};


// 🗑️ Delete Class (With Optimistic Update)
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/classes?id=${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.classes(tenantId) });
      const previousClasses = queryClient.getQueryData(QueryKeys.classes(tenantId));
      
      // Optimistically remove from UI
      queryClient.setQueryData(QueryKeys.classes(tenantId), (old: any[]) => 
        old.filter((c: any) => c.id !== deletedId)
      );
      
      return { previousClasses };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(QueryKeys.classes(tenantId), context?.previousClasses);
    },
    onSettled: () => {
      // Sync with server at the end
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes(tenantId) });
    },
  });
};

