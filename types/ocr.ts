// types/ocr.ts
export interface OCRConfidence {
  value: any;
  confidence: number; // 0.0 – 1.0
  needsReview: boolean;
}

export interface OCRResult {
  fields: Record<string, OCRConfidence>;
  overallConfidence: number;
  humanReviewRequired: boolean;
  rawText?: string;
  documentType?: string;
  processingTimeMs: number;
  providerUsed: string;
  modelUsed: string;
}

export interface OCRDocumentStrategy {
  type: string;
  prompt: string;
  validate(data: any): boolean;
  calculateConfidence(data: any): number;
  normalize(data: any): any;
}

export type DocumentType = "staff" | "student" | "cnic" | "salary_slip" | "degree" | "invoice" | "transcript" | "cv";

export interface OCRRequest {
  file: Buffer;
  mimeType: string;
  fileName: string;
  tenantId: string;
  userId: string;
  documentType?: DocumentType;
}

export interface AIProviderConfig {
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface ReviewQueueItem {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  extractedData: OCRResult;
  status: ReviewStatus;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  auditLog: AuditEntry[];
  originalFileName: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface AuditEntry {
  action: string;
  userId: string;
  timestamp: Date;
  details?: string;
}
