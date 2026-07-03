// hooks/useAI.ts
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";

export const useAskChatbot = () => {
  return useMutation({
    mutationFn: async (question: string) => {
      const res = await apiClient.post("/ai/chatbot", { question });
      return safeObject(res);
    },
  });
};
