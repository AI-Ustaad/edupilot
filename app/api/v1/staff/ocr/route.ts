// app/api/v1/staff/ocr/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";
import { OCRService } from "@/services/OCRService";
import { logger } from "@/lib/logger/logger";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.create)(
        async (req: Request, { tenantId, user }: TenantContext) => {
          // AI Quota & Burst Rate Limit Guard
          const quotaCheck = await enforceAiQuota(user, "ocr-staff");
          if (!quotaCheck.allowed) {
            return createAiErrorResponse(quotaCheck);
          }

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

          const startTime = Date.now();
          try {
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

            await recordAiTelemetry({
              tenantId,
              userId: user.uid,
              featureKey: "ocr-staff",
              latencyMs: Date.now() - startTime,
              success: true,
            });

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
              humanReviewRequired: result.humanReviewRequired,
              processingTimeMs: result.processingTimeMs,
            });
          } catch (err: any) {
            await recordAiTelemetry({
              tenantId,
              userId: user.uid,
              featureKey: "ocr-staff",
              latencyMs: Date.now() - startTime,
              success: false,
              error: err.message,
            });

            return createErrorResponse(500, "Staff OCR processing failed.");
          }
        }
      )
    )
  )
);
