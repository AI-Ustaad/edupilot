// hooks/useTeacher.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

// 1. Assignments
export const useAssignments = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["assignments", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/assignments")),
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/assignments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", tenantId] });
      showToast("Assignment created successfully!", "success");
    },
    onError: () => showToast("Failed to create assignment.", "error"),
  });
};

// 2. Lesson Plans
export const useLessonPlans = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["lessonPlans", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/lesson-plans")),
  });
};

export const useCreateLessonPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/lesson-plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonPlans", tenantId] });
      showToast("Lesson plan saved!", "success");
    },
  });
};

// 3. Books (Manage Books & Book Center)
export const useBooks = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["books", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/books")),
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books", tenantId] });
      showToast("Book added successfully!", "success");
    },
  });
};

// 4. Behavior Points
export const useRecordBehavior = () => {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/behavior", data),
    onSuccess: () => showToast("Behavior recorded!", "success"),
    onError: () => showToast("Failed to record behavior.", "error"),
  });
};
