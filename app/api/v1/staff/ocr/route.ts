// app/api/v1/staff/ocr/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";
import { OCRService } from "@/services/OCRService";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.create)(
        async (req: Request, { tenantId, user }: TenantContext) => {
          const formData = await req.formData();
          const file = formData.get("file") as File;

          if (!file) {
            return createErrorResponse(400, "No file provided");
          }

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(new Uint8Array(bytes));

          const ocrService = new OCRService();

          // Validate file first
          const validationError = ocrService.validateFile(file.type, file.name, file.size);
          if (validationError) {
            return createErrorResponse(415, validationError);
          }

          const result = await ocrService.processDocument(
            buffer,
            file.type,
            file.name,
            tenantId,
            user.uid,
            "staff"
          );

          // Build response with photo base64 if image
          let photoBase64: string | null = null;
          if (file.type.startsWith("image/")) {
            photoBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;
          }

          const data = {
            ...result.fields,
            photoBase64,
            confidence: result.overallConfidence,
            needsReview: result.humanReviewRequired,
          };

          logger.ocr("Staff OCR processed", {
            tenantId,
            userId: user.uid,
            metadata: {
              provider: result.providerUsed,
              model: result.modelUsed,
              mime: file.type,
              size: file.size,
              confidence: result.overallConfidence,
              needsReview: result.humanReviewRequired,
              processingTime: result.processingTimeMs,
            },
          });

          return createApiResponse(200, data, "OCR extraction complete", {
            confidence: result.overallConfidence,
            needsReview: result.humanReviewRequired,
            processingTime: result.processingTimeMs,
          });
        }
      )
    )
  )
);
