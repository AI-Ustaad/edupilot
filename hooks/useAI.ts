// hooks/useAI.ts
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";

// 🤖 Ask AI Chatbot
export const useAskChatbot = () => {
  return useMutation({
    mutationFn: async (question: string) => {
      const res = await apiClient.post("/ai/chatbot", { question });
      return safeObject(res); // Returns { answer: "..." }
    },
  });
};

// 📝 Generate AI Exam Questions
export const useGenerateExamQuestions = () => {
  return useMutation({
    mutationFn: async (data: { className: string; subject: string; topic: string; difficulty: string }) => {
      const res = await apiClient.post("/ai/exam-questions", data);
      return safeObject(res); // Returns { mcqs: [...], shortAnswers: [...], longAnswer: {...} }
    },
  });
};

// 📅 Generate AI Timetable
export const useGenerateTimetable = () => {
  return useMutation({
    mutationFn: async (data: { classes: string[]; days: string[]; periods: number; subjects: string[]; teachers: string[] }) => {
      const res = await apiClient.post("/ai/timetable", data);
      return safeObject(res);
    },
  });
};
