// services/ai.service.ts
import { aiProvider, AIMessage } from "@/lib/ai/provider";
import { sanitizeUserInput } from "@/lib/ai/prompt-guard";
import { buildSystemPrompt } from "@/lib/ai/context-builder";
import { logAIUsage } from "@/lib/ai/usage-logger";

class AIService {
  async chat(rawQuestion: string, tenantId: string, userId: string, role: string): Promise<string> {
    const startTime = Date.now();
    let success = false;
    let tokensUsed = 0;

    try {
      // 1. Sanitize Input
      const safeQuestion = sanitizeUserInput(rawQuestion);
      if (!safeQuestion) throw new Error("Invalid input.");

      // 2. Build Context
      const systemPrompt = await buildSystemPrompt(tenantId, role);

      // 3. Prepare Messages
      const messages: AIMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: safeQuestion }
      ];

      // 4. Call Provider
      const response = await aiProvider.generateResponse(messages);
      success = true;
      tokensUsed = response.tokensUsed;

      return response.text;

    } catch (error) {
      throw error; // Route will handle Sentry capture
    } finally {
      // 5. Log Usage
      await logAIUsage({
        tenantId,
        userId,
        route: "chatbot",
        model: "gemini-1.5-flash",
        tokensUsed,
        durationMs: Date.now() - startTime,
        success
      });
    }
  }

  // Principal Agent کے لیے بھی یہی Pattern استعمال ہوگا
  // async principalAgent(...) { ... }
}

// 🚀 Singleton Instance
export const aiService = new AIService();
