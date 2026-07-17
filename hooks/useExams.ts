// hooks/useExams.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import type { SaveMarkInput } from "@/validators/marks";

// Fetch Marks by Class, Section, Term, Subject
export const useMarks = (classGrade: string, section: string, term: string, subject: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["marks", tenantId, classGrade, section, term, subject],
    queryFn: async () => {
      if (!classGrade || !section || !term || !subject) return [];
      const res = await apiClient.get("/marks", { params: { classGrade, section, term, subject } });
      return safeArray(res);
    },
    enabled: !!tenantId && !!classGrade && !!section && !!term && !!subject,
  });
};

// Save Single or Bulk Marks
export const useSaveMarks = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (data: SaveMarkInput) => {
      return apiClient.post("/marks", data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["marks", tenantId, variables.classGrade, variables.section, variables.term, variables.subject] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", tenantId] });
    },
  });
};

// Delete Mark (soft delete)
export const useDeleteMark = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/marks?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks", tenantId] });
    },
  });
};

// Fetch Quizzes
export const useQuizzes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quizzes", user?.tenantId],
    queryFn: async () => {
      const res = await apiClient.get("/quizzes");
      return safeArray(res);
    },
    enabled: !!user?.tenantId,
  });
};

// Submit Quiz
export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (data: { quizId: string; studentId: string; studentName?: string; answers: { selected: string }[] }) => {
      return apiClient.post("/quizzes/submit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", tenantId] });
    },
  });
};

// Fetch Quiz Results/Submissions
export const useQuizResults = (quizId: string | null) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quiz-results", user?.tenantId, quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const res = await apiClient.get("/quizzes/results", { params: { quizId } });
      return safeArray(res);
    },
    enabled: !!user?.tenantId && !!quizId,
  });
};
