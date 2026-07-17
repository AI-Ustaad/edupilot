// interfaces/IOCRService.ts
import { OCRResult, DocumentType } from "@/types/ocr";

export interface IOCRService {
  processDocument(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    tenantId: string,
    userId: string,
    documentType?: DocumentType
  ): Promise<OCRResult>;

  validateFile(mimeType: string, fileName: string, size: number): string | null;
}
