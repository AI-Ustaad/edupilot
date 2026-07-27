// interfaces/IOCRService.ts
import type { DocumentType, OCRResult } from "@/types/ocr";

export interface IOCRService {
  processDocument(buffer: Buffer, mimeType: string, fileName: string, tenantId: string, userId: string, documentType: DocumentType): Promise<OCRResult>;
}
