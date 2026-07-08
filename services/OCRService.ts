// services/OCRService.ts
import { OCRResult, DocumentType } from "@/types/ocr";
import { AIGateway } from "@/lib/ai/gateway/AIGateway";
import { OCRException } from "@/errors/AppError";
import { AuditService } from "./AuditService";
import sharp from "sharp";

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export class OCRService {
  private gateway: AIGateway;
  private audit: AuditService;

  constructor(gateway?: AIGateway) {
    this.gateway = gateway ?? new AIGateway();
    this.audit = new AuditService();
  }

  private readonly ALLOWED_MIME_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ]);

  private readonly ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "pdf"]);

  private readonly MAX_IMAGE_DIMENSION = 2000;
  private readonly MAX_PDF_PAGES = 10;
  private readonly MAX_FILE_SIZE = 4_000_000;

  validateFile(mimeType: string, fileName: string, size: number): string | null {
    const extension = getFileExtension(fileName);

    if (!this.ALLOWED_MIME_TYPES.has(mimeType) || !this.ALLOWED_EXTENSIONS.has(extension)) {
      return `Unsupported file type: ${mimeType} (.${extension}). Please upload PNG, JPG, WEBP, or PDF.`;
    }

    if (size > this.MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 4MB.";
    }

    return null;
  }

  private async resizeImageIfNeeded(buffer: Buffer, mimeType: string): Promise<Buffer> {
    if (!mimeType.startsWith("image/")) return buffer;

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    if (width <= this.MAX_IMAGE_DIMENSION && height <= this.MAX_IMAGE_DIMENSION) {
      return buffer;
    }

    return sharp(buffer)
      .resize({
        width: this.MAX_IMAGE_DIMENSION,
        height: this.MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  private async getPdfPageCount(buffer: Buffer, mimeType: string): Promise<number> {
    if (mimeType !== "application/pdf") return 0;
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.numpages;
  }

  async processDocument(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    tenantId: string,
    userId: string,
    documentType: DocumentType = "staff"
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Validate file
      const validationError = this.validateFile(mimeType, fileName, buffer.length);
      if (validationError) {
        throw new OCRException(validationError);
      }

      // Resize oversized images
      let processedBuffer = buffer;
      processedBuffer = Buffer.from(await this.resizeImageIfNeeded(processedBuffer, mimeType));

      // Reject long PDFs
      const pdfPageCount = await this.getPdfPageCount(processedBuffer, mimeType);
      if (pdfPageCount > this.MAX_PDF_PAGES) {
        throw new OCRException(
          `PDF has ${pdfPageCount} pages. Maximum allowed is ${this.MAX_PDF_PAGES} pages.`
        );
      }

      // Delegate to AI Gateway
      const result = await this.gateway.processDocument(
        processedBuffer,
        mimeType,
        documentType,
        tenantId,
        userId
      );

      const processingTimeMs = Date.now() - startTime;

      await this.audit.log({
        action: "ocr.processed",
        userId,
        tenantId,
        entityType: "ocr",
        metadata: {
          documentType,
          fileName,
          processingTimeMs,
          confidence: result.overallConfidence,
          needsReview: result.humanReviewRequired,
          provider: result.providerUsed,
          model: result.modelUsed,
          tokens: (result as any).tokens,
        },
      });

      return {
        ...result,
        processingTimeMs,
      };
    } catch (error) {
      throw new OCRException(
        error instanceof OCRException ? error.message : "OCR processing failed",
        { mimeType, fileName, documentType }
      );
    }
  }
}
