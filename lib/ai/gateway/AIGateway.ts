// lib/ai/gateway/AIGateway.ts
import { OCRResult, DocumentType } from "@/types/ocr";
import { IAIGateway } from "@/interfaces/IAIGateway";
import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { StaffStrategy } from "@/lib/ai/strategies/StaffStrategy";
import { DocumentStrategy } from "@/interfaces/IAIGateway";
import { ProviderException, OCRException } from "@/errors/AppError";

export class AIGateway implements IAIGateway {
  private provider: GeminiProvider;
  private strategies: Map<DocumentType, DocumentStrategy>;

  constructor() {
    this.provider = new GeminiProvider();
    this.strategies = new Map();
    this.registerStrategies();
  }

  private registerStrategies(): void {
    const staffStrategy = new StaffStrategy();
    this.strategies.set("staff", staffStrategy);
    // Future strategies will be added here:
    // this.strategies.set("student", new StudentStrategy());
    // this.strategies.set("cnic", new CNICStrategy());
    // this.strategies.set("degree", new DegreeStrategy());
    // this.strategies.set("salary_slip", new SalarySlipStrategy());
    // this.strategies.set("invoice", new InvoiceStrategy());
    // this.strategies.set("transcript", new TranscriptStrategy());
    // this.strategies.set("cv", new CVStrategy());
  }

  getProvider(): string {
    return this.provider.name;
  }

  async processDocument(
    buffer: Buffer,
    mimeType: string,
    documentType: DocumentType,
    tenantId: string,
    userId: string
  ): Promise<OCRResult> {
    const strategy = this.strategies.get(documentType);
    if (!strategy) {
      throw new OCRException(`No OCR strategy registered for document type: ${documentType}`);
    }

    const base64Data = buffer.toString("base64");
    const prompt = strategy.buildPrompt();
    const systemInstruction = strategy.buildSystemInstruction();

    const startTime = Date.now();

    // Call the AI provider
    const providerResponse = await this.provider.generateContent(
      prompt,
      systemInstruction,
      { data: base64Data, mimeType }
    );

    // Parse the response using the strategy
    let parsedData: any;
    try {
      parsedData = strategy.extractJson(providerResponse.text);
    } catch (parseError) {
      throw new OCRException("Failed to parse AI response", {
        providerResponse: providerResponse.text.substring(0, 200),
      });
    }

    // Validate with strategy
    if (!strategy.validateResponse(parsedData)) {
      throw new OCRException("AI response failed validation", { parsedData });
    }

    // Normalize with strategy
    const normalizedData = strategy.normalize(parsedData);

    // Calculate confidence
    const overallConfidence = strategy.calculateConfidence(normalizedData);
    const humanReviewRequired = overallConfidence < 0.6;

    const processingTimeMs = Date.now() - startTime;

    return {
      fields: this.buildConfidenceFields(normalizedData, overallConfidence),
      overallConfidence,
      humanReviewRequired,
      documentType,
      processingTimeMs,
      providerUsed: this.provider.name,
      modelUsed: this.provider.getConfig().model,
    };
  }

  private buildConfidenceFields(
    data: Record<string, any>,
    overallConfidence: number
  ): Record<string, { value: any; confidence: number; needsReview: boolean }> {
    const fields: Record<string, { value: any; confidence: number; needsReview: boolean }> = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = {
        value,
        confidence: value ? overallConfidence : 0,
        needsReview: overallConfidence < 0.7,
      };
    }
    return fields;
  }
}
