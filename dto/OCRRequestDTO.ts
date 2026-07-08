// dto/OCRRequestDTO.ts
import { DocumentType } from "@/types/ocr";

export interface OCRRequestDTO {
  file: Buffer;
  mimeType: string;
  fileName: string;
  tenantId: string;
  userId: string;
  documentType?: DocumentType;
}

export interface OCRResponseDTO {
  success: boolean;
  data?: any;
  confidence?: number;
  needsReview?: boolean;
  error?: string;
}
