// app/api/v1/staff/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { OCRService } from "@/services/OCRService";
import { AppError } from "@/errors/AppError";
import { logger } from "@/lib/logger/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(bytes));

    const ocrService = new OCRService();

    // Validate file first
    const validationError = ocrService.validateFile(file.type, file.name, file.size);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 415 });
    }

    const result = await ocrService.processDocument(
      buffer,
      file.type,
      file.name,
      user.tenantId,
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
      tenantId: user.tenantId,
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

    return NextResponse.json({
      success: true,
      data,
      meta: {
        confidence: result.overallConfidence,
        needsReview: result.humanReviewRequired,
        processingTime: result.processingTimeMs,
      },
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          processingTime,
        },
        { status: error.statusCode }
      );
    }

    logger.error("[Staff OCR] Error:", { metadata: { error: error.message } });
    return NextResponse.json(
      { success: false, error: "Failed to process document", processingTime },
      { status: 500 }
    );
  }
}

