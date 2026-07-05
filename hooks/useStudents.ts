// hooks/useStudents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray, safeObject } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

// 1. 🔄 Fetch All Students (Crash-Proof)
export const useStudents = (params?: { classGrade?: string; section?: string }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: [...QueryKeys.students(tenantId), params],
    queryFn: async () => {
      try {
        const queryString = new URLSearchParams(params as any).toString();
        const url = `/students${queryString ? `?${queryString}` : ""}`;
        const response = await apiClient.get(url);
        
        // 🛡️ Bulletproof Array Extraction
        let data = Array.isArray(response) ? response : (response?.data || []);
        if (!Array.isArray(data)) data = [];
        
        return data;
      } catch (error) {
        console.error("Failed to fetch students:", error);
        return [];
      }
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// 2. 🔄 Fetch Single Student by ID
export const useStudent = (id: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.student(tenantId, id),
    queryFn: async () => {
      const response = await apiClient.get(`/students/${id}`);
      return safeObject(response);
    },
    enabled: !!id && !!tenantId,
  });
};

// 3. 🔄 Fetch Student 360 Data
export const useStudent360 = (id: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["students", tenantId, id, "360"],
    queryFn: async () => {
      const response = await apiClient.get(`/students/360?id=${id}`);
      return safeObject(response);
    },
    enabled: !!id && !!tenantId,
  });
};

// 4. ✨ Create Student
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.students(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};

// 5. ✏️ Update Student
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiClient.put(`/students/${id}`, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.students(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.student(tenantId, variables.id) });
    },
  });
};

// 6. 🗑️ Delete Student (With Optimistic Update & Undo)
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/students/${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.students(tenantId) });
      const previousStudents = queryClient.getQueryData(QueryKeys.students(tenantId));
      queryClient.setQueryData(QueryKeys.students(tenantId), (old: any[]) => 
        old.filter((s: any) => s.id !== deletedId)
      );
      return { previousStudents };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(QueryKeys.students(tenantId), context?.previousStudents);
      showToast("Failed to delete student.", "error");
    },
    onSuccess: (_data, _deletedId, context) => {
      showToast("Student deleted successfully.", "undo", () => {
        queryClient.setQueryData(QueryKeys.students(tenantId), context?.previousStudents);
        showToast("Student restored.", "success");
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.students(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
