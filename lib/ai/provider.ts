// lib/ai/provider.ts
import * as Sentry from "@sentry/nextjs";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  tokensUsed: number;
}

class GeminiProvider {
  private apiKey: string;
  private model: string = "gemini-2.0-flash";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    if (!this.apiKey) console.error("[AI Provider] GEMINI_API_KEY is missing.");
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.apiKey) throw new Error("AI Service is not configured.");

    const systemInstruction = messages.find(m => m.role === "system")?.content || "";
    const userMessages = messages.filter(m => m.role !== "system");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    let lastError: Error | null = null;
    const maxRetries = 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 🛡️ 15 Second Timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            contents: userMessages.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            })),
            generationConfig: { temperature: 0.7 }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        if (!response.ok) {
          let errorMsg = `AI Error: ${response.statusText}`;
          try { errorMsg = JSON.parse(text).error?.message || errorMsg; } catch (e) {}
          throw new Error(errorMsg);
        }

        const data = JSON.parse(text);
        const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answerText) throw new Error("AI returned an empty response.");

        // Token Counting (Gemini provides usageMetadata)
        const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

        return { text: answerText, tokensUsed };

      } catch (error: any) {
        lastError = error;
        if (error.name === 'AbortError') {
          throw new Error("AI request timed out after 15 seconds.");
        }
        // Retry only on 429, 500, 503
        if (error.message.includes("429") || error.message.includes("500") || error.message.includes("503")) {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
        }
        // Don't retry on other errors
        break;
      }
    }

    Sentry.captureException(lastError);
    throw lastError || new Error("Failed to generate AI response.");
  }
}

// 🚀 Singleton Instance
export const aiProvider = new GeminiProvider();
