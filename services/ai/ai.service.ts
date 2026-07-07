// services/ai/ai.service.ts
import { aiProvider, AIMessage } from "@/lib/ai/provider";
import { sanitizeUserInput } from "@/lib/ai/prompt-guard";
import { buildSystemPrompt } from "@/lib/ai/context-builder";
import { logAIUsage } from "@/lib/ai/usage-logger";

class AIService {
  // Helper: Log usage aur Provider ko call karne ki generic logic
  private async execute(messages: AIMessage[], tenantId: string, userId: string, routeName: string): Promise<string> {
    const startTime = Date.now();
    let success = false;
    let tokensUsed = 0;

    try {
      const response = await aiProvider.generateResponse(messages);
      success = true;
      tokensUsed = response.tokensUsed;
      return response.text;
    } catch (error) {
      throw error;
    } finally {
      await logAIUsage({
        tenantId, userId, route: routeName, model: "gemini-2.0-flash",
        tokensUsed, durationMs: Date.now() - startTime, success
      });
    }
  }

  // 1. Chatbot
  async chat(rawQuestion: string, tenantId: string, userId: string, role: string): Promise<string> {
    const systemPrompt = await buildSystemPrompt(tenantId, role);
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: String(sanitizeUserInput(rawQuestion)) }
    ];
    return this.execute(messages, tenantId, userId, "chatbot");
  }

  // 2. Exam Generator
  async generateExamQuestions(data: any, tenantId: string, userId: string, role: string): Promise<string> {
    const systemPrompt = await buildSystemPrompt(tenantId, role);
    const prompt = `Generate a JSON object containing 3 MCQs (with options and correct answer), 2 short answer questions (with model answers), and 1 long answer question (with model answer) for Class ${data.className}, Subject: ${data.subject}, Topic: ${data.topic}, Difficulty: ${data.difficulty}. Format strictly as JSON.`;
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt + " You are an expert exam creator. Return ONLY valid JSON." },
      { role: "user", content: prompt }
    ];
    return this.execute(messages, tenantId, userId, "exam-questions");
  }

  // 3. Timetable Generator
  async generateTimetable(data: any, tenantId: string, userId: string, role: string): Promise<string> {
    const systemPrompt = await buildSystemPrompt(tenantId, role);
    const prompt = `Generate a school timetable as a JSON array of objects. Data: ${JSON.stringify(data)}. Each object should have: day, period, subject, class, teacher.`;
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt + " You are an expert timetable scheduler. Return ONLY valid JSON array." },
      { role: "user", content: prompt }
    ];
    return this.execute(messages, tenantId, userId, "timetable");
  }

  // 4. Report Comments
  async generateReportComments(data: any, tenantId: string, userId: string, role: string): Promise<string> {
    const systemPrompt = await buildSystemPrompt(tenantId, role);
    const prompt = `Write a personalized report card comment for ${data.studentName} (Class ${data.grade}, Subject ${data.subject}). Marks: ${data.marks}%, Attendance: ${data.attendance}%.`;
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt + " You are a compassionate teacher writing report card comments." },
      { role: "user", content: prompt }
    ];
    return this.execute(messages, tenantId, userId, "report-comments");
  }

  // 5. Smart Book Center
  async smartBookCenter(data: any, tenantId: string, userId: string, role: string): Promise<string> {
    const systemPrompt = await buildSystemPrompt(tenantId, role);
    const prompt = `Query: ${data.query}, Grade: ${data.grade}, Type: ${data.type}`;
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt + " You are an AI librarian and educational resource expert." },
      { role: "user", content: prompt }
    ];
    return this.execute(messages, tenantId, userId, "smart-book-center");
  }

  // 6. Principal Agent
  async principalAgent(schoolData: any, tenantId: string, userId: string, role: string): Promise<string> {
    const systemPrompt = await buildSystemPrompt(tenantId, role);
    const prompt = `Analyze this school data and provide executive summary, risks, and recommendations. Data: ${JSON.stringify(schoolData)}`;
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt + " You are the Principal Agent for EduPilot." },
      { role: "user", content: prompt }
    ];
    return this.execute(messages, tenantId, userId, "principal-agent");
  }
}

// 🚀 Singleton Instance
export const aiService = new AIService();
