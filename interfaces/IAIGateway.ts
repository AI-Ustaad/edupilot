// interfaces/IAIGateway.ts
import { OCRResult, DocumentType, AIProviderConfig } from "@/types/ocr";

export interface IAIGateway {
  processDocument(
    buffer: Buffer,
    mimeType: string,
    documentType: DocumentType,
    tenantId: string,
    userId: string
  ): Promise<OCRResult>;

  getProvider(): string;
}

export interface AIProvider {
  name: string;
  generateContent(
    prompt: string,
    systemInstruction?: string,
    file?: { data: string; mimeType: string }
  ): Promise<AIProviderResponse>;
  isAvailable(): boolean;
  getConfig(): AIProviderConfig;
}

export interface AIProviderResponse {
  text: string;
  finishReason?: string;
  tokensUsed?: number;
  promptTokens?: number;
  candidates?: number;
}

export interface DocumentStrategy {
  type: DocumentType;
  buildPrompt(fileBuffer?: Buffer): string;
  buildSystemInstruction(): string;
  validateResponse(data: any): boolean;
  calculateConfidence(data: any): number;
  normalize(data: any): any;
  extractJson(text: string): any;
}
