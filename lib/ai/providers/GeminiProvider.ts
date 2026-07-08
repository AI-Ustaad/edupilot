// lib/ai/providers/GeminiProvider.ts
import { AIProvider, AIProviderResponse } from "@/interfaces/IAIGateway";
import { AIProviderConfig } from "@/types/ocr";
import { ProviderException } from "@/errors/AppError";

export class GeminiProvider implements AIProvider {
  public readonly name = "gemini";

  private readonly config: AIProviderConfig;

  constructor() {
    const model = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash").trim();
    const baseUrl = (process.env.GEMINI_BASE ?? "https://generativelanguage.googleapis.com/v1beta").trim();
    const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";

    this.config = {
      name: "gemini",
      model,
      apiKey,
      baseUrl,
      timeout: 55000,
      maxRetries: 3,
    };
  }

  getConfig(): AIProviderConfig {
    return this.config;
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    file?: { data: string; mimeType: string }
  ): Promise<AIProviderResponse> {
    if (!this.isAvailable()) {
      throw new ProviderException("GEMINI_API_KEY is not configured");
    }

    const url = `${this.config.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const parts: any[] = [];

    if (file) {
      parts.push({
        inline_data: {
          mime_type: file.mimeType,
          data: file.data,
        },
      });
    }

    parts.push({ text: prompt });

    const requestBody: any = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    if (systemInstruction) {
      requestBody.system_instruction = { parts: [{ text: systemInstruction }] };
    }

    let lastError: any = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        const responseText = await res.text();

        if (!res.ok) {
          console.warn(`[GeminiProvider] API error (attempt ${attempt + 1}):`, responseText);
          const isRetryable = /429|500|502|503|504/.test(String(res.status));
          if (isRetryable && attempt < this.config.maxRetries - 1) {
            await this.delay(1000 * (attempt + 1));
            continue;
          }
          let message = "AI provider error";
          try {
            const parsed = JSON.parse(responseText);
            if (parsed.error?.message) message = parsed.error.message;
          } catch {}
          throw new ProviderException(message, { status: res.status });
        }

        const data = JSON.parse(responseText);

        // Check safety blocks
        if (data.promptFeedback?.blockReason) {
          throw new ProviderException(`Content blocked by safety filter: ${data.promptFeedback.blockReason}`);
        }

        if (!data.candidates?.length) {
          throw new ProviderException("AI returned no candidates");
        }

        const candidate = data.candidates[0];

        if (candidate.finishReason && candidate.finishReason !== "STOP") {
          if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
            throw new ProviderException(`Content blocked: ${candidate.finishReason}`);
          }
          if (candidate.finishReason === "MAX_TOKENS") {
            throw new ProviderException("AI response was truncated");
          }
        }

        const text = candidate.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";

        return {
          text,
          finishReason: candidate.finishReason,
          tokensUsed: data.usageMetadata?.totalTokenCount,
          promptTokens: data.usageMetadata?.promptTokenCount,
          candidates: data.candidates?.length,
        };
      } catch (error: any) {
        lastError = error;
        if (error instanceof ProviderException) throw error;
        if (error.name === "AbortError") {
          if (attempt < this.config.maxRetries - 1) {
            console.warn(`[GeminiProvider] Timeout (attempt ${attempt + 1}), retrying...`);
            continue;
          }
          throw new ProviderException("AI request timed out after retries");
        }
        if (attempt < this.config.maxRetries - 1) {
          console.warn(`[GeminiProvider] Request failed (attempt ${attempt + 1}):`, error.message);
          await this.delay(1000 * (attempt + 1));
          continue;
        }
        throw new ProviderException(error.message || "AI request failed");
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError || new ProviderException("AI request failed after all retries");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
