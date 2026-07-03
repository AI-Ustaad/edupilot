// hooks/useSyllabus.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useSyllabus = (classGrade?: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["syllabus", tenantId, classGrade],
    queryFn: async () => safeArray(await apiClient.get("/syllabus", { params: { classGrade } })),
  });
};

export const useCreateSyllabus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/syllabus", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["syllabus", tenantId] }),
  });
};

export const useDeleteSyllabus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/syllabus/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["syllabus", tenantId] }),
  });
};
