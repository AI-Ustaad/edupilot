// hooks/useTeacher.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import type { CreateAssignmentInput, CreateLessonPlanInput, CreateBookInput, RecordBehaviorInput } from "@/validators/teacher";
import type { Assignment } from "@/types/teacher";

// 1. Assignments
export const useAssignments = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery<(Assignment & { id: string })[]>({
    queryKey: ["assignments", tenantId],
    queryFn: async () => {
      const res = await apiClient.get("/assignments");
      const data = res.data;
      return safeArray(data?.data || data);
    },
    staleTime: 0,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateAssignmentInput) => apiClient.post("/assignments", data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignments"] });
      await queryClient.refetchQueries({ queryKey: ["assignments"] });
      showToast("Assignment created successfully!", "success");
    },
    onError: () => showToast("Failed to create assignment.", "error"),
  });
};

// Delete Assignment
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/assignments/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignments"] });
      await queryClient.refetchQueries({ queryKey: ["assignments"] });
      showToast("Assignment deleted successfully.", "success");
    },
    onError: () => {
      showToast("Failed to delete assignment.", "error");
    },
  });
};

// 2. Lesson Plans
export const useLessonPlans = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["lessonPlans", tenantId],
    queryFn: async () => {
      const res = await apiClient.get("/lesson-plans");
      const data = res.data;
      return safeArray(data?.data || data);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useCreateLessonPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateLessonPlanInput) => apiClient.post("/lesson-plans", data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lessonPlans", tenantId] });
      await queryClient.refetchQueries({ queryKey: ["lessonPlans", tenantId] });
      showToast("Lesson plan saved!", "success");
    },
  });
};

export const useDeleteLessonPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/lesson-plans/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lessonPlans", tenantId] });
      await queryClient.refetchQueries({ queryKey: ["lessonPlans", tenantId] });
      showToast("Lesson plan deleted!", "success");
    },
    onError: () => showToast("Failed to delete lesson plan.", "error"),
  });
};

// 3. Books (Manage Books & Book Center)
export const useBooks = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["books", tenantId],
    queryFn: async () => {
      const res = await apiClient.get("/books");
      const data = res.data;
      return safeArray(data?.data || data);
    },
    staleTime: 0,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateBookInput) => apiClient.post("/books", data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["books"] });
      await queryClient.refetchQueries({ queryKey: ["books"] });
      showToast("Book added successfully!", "success");
    },
    onError: () => showToast("Failed to create book.", "error"),
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/books/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["books"] });
      await queryClient.refetchQueries({ queryKey: ["books"] });
      showToast("Book deleted successfully!", "success");
    },
    onError: () => showToast("Failed to delete book.", "error"),
  });
};

// 4. Behavior Points
export const useRecordBehavior = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: RecordBehaviorInput) => apiClient.post("/behavior", data),
    onSuccess: (_data, variables) => {
      // Invalidate student queries to refresh behavior points
      queryClient.invalidateQueries({ queryKey: ["student"] });
      showToast("Behavior recorded!", "success");
    },
    onError: () => showToast("Failed to record behavior.", "error"),
  });
};
