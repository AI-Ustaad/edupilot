// hooks/useAIAgents.ts
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useToast } from "@/components/ToastProvider";

// 🤖 Principal Agent Mutation
export const usePrincipalAgent = () => {
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await apiClient.post("/ai/agents", { agentType: "principal", context: query });
      return safeObject(res);
    },
    onError: () => showToast("Failed to generate insights.", "error"),
  });
};

// 🤖 Teacher Agent Mutation
export const useTeacherAgent = () => {
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { topic: string; classGrade: string; subject: string }) => {
      const res = await apiClient.post("/ai/agents", { agentType: "teacher", context: data });
      return safeObject(res);
    },
    onError: () => showToast("Failed to generate content.", "error"),
  });
};
