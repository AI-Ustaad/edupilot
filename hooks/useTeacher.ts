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
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateAssignmentInput) => apiClient.post("/assignments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", tenantId] });
      showToast("Assignment created successfully!", "success");
    },
    onError: () => showToast("Failed to create assignment.", "error"),
  });
};

// Delete Assignment (With Optimistic Update & Undo)
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/assignments/${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["assignments", tenantId] });
      
      const previousAssignments = queryClient.getQueryData(["assignments", tenantId]);
      
      // Optimistically remove from UI
      queryClient.setQueryData(["assignments", tenantId], (old: (Assignment & { id: string })[]) => 
        old.filter((a) => a.id !== deletedId)
      );
      
      return { previousAssignments };
    },
    onError: (_err, _deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(["assignments", tenantId], context?.previousAssignments);
      showToast("Failed to delete assignment.", "error");
    },
    onSuccess: (_data, _deletedId, context) => {
      // Show Toast with Undo option
      showToast("Assignment deleted successfully.", "undo", () => {
        // Undo Logic: Restore in UI
        queryClient.setQueryData(["assignments", tenantId], context?.previousAssignments);
        showToast("Assignment restored.", "success");
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", tenantId] });
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
  });
};

export const useCreateLessonPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateLessonPlanInput) => apiClient.post("/lesson-plans", data),
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
    mutationFn: async (data: CreateBookInput) => apiClient.post("/books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books", tenantId] });
      showToast("Book added successfully!", "success");
    },
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
