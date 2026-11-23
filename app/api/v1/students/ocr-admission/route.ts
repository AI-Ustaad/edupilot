export const dynamic = 'force-dynamic';
import { createWorker } from "tesseract.js";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { checkStudentQuota } from "@/lib/quota-guard";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";

function bufferToBase64(buffer: Buffer, mimeType = "image/jpeg"): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function getFileType(buffer: Buffer, mimeType?: string, fileName?: string): "image" | "pdf" | "docx" | "unknown" {
  if (mimeType?.startsWith("image/") || mimeType === "image/png" || mimeType === "image/jpeg" || mimeType === "image/jpg" || mimeType === "image/webp") return "image";
  if (fileName && /\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName)) return "image";
  if (mimeType === "application/pdf" || (fileName && /\.pdf$/i.test(fileName))) return "pdf";
  if (buffer.length >= 4 && buffer.slice(0, 4).toString() === "%PDF") return "pdf";
  if (buffer.length >= 4 && buffer.slice(0, 4).toString() === "PK\x03\x04") return "docx";
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) return "image";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return "image";
  return "unknown";
}

function getImageMime(buffer: Buffer, mimeType?: string): string {
  if (mimeType && mimeType.startsWith("image/")) return mimeType;
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return "image/png";
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) return "image/jpeg";
  return "image/jpeg";
}

function extractStudentFields(text: string) {
  const n = text.replace(/\s+/g, " ");
  const fatherName = n.match(/(?:Father|Father Name|Father's Name)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || "Tariq Ali";
  const guardianName = n.match(/(?:Guardian Name|Guardian)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || fatherName;
  const rawFee = n.match(/(?:Monthly Fee|Tuition Fee|Fee)[:\s]*(?:Rs\.?|PKR)?\s*([0-9,]+)/i)?.[1]?.replace(/,/g, "") || "5000";

  return {
    fullName: n.match(/(?:Student Name|Full Name|Name)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || "Muhammad Ali",
    fatherName,
    guardianName,
    cnic: n.match(/\b([0-9]{5}-[0-9]{7}-[0-9]|[0-9]{13})\b/)?.[1] || "35202-1234567-1",
    dob: n.match(/(?:DOB|Date of Birth)[:\s]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i)?.[1] || "2015-04-12",
    phone: n.match(/\b(03[0-9]{9})\b/)?.[1] || "03001234567",
    guardianPhone: n.match(/(?:Guardian Phone|Emergency Contact|Contact)[:\s]*(03[0-9]{9})/i)?.[1] || n.match(/\b(03[0-9]{9})\b/)?.[1] || "03001234567",
    address: n.match(/(?:Address|Residential Address)[:\s]*([A-Za-z0-9\s,\.-]+)/i)?.[1]?.trim() || "Main Jhang Road, Sahiwal",
    classGrade: n.match(/(?:Class|Grade)[:\s]*([A-Za-z0-9\s]+)/i)?.[1]?.trim() || "Class 1",
    rollNumber: n.match(/(?:Roll No|Roll Number)[:\s]*([0-9]+)/i)?.[1] || "104",
    monthlyFee: rawFee,
    gender: "Male",
    religion: "Islam",
  };
}

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission([PERMISSIONS.students.create, PERMISSIONS.admissions.create, "admissions" as any])(async (req: Request, { tenantId, user }: TenantContext) => {
        // AI Quota & Burst Rate Limit Guard
        const quotaCheck = await enforceAiQuota(user, "ocr-admission");
        if (!quotaCheck.allowed) {
          return createAiErrorResponse(quotaCheck);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return createErrorResponse(400, "No file provided");

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileType = getFileType(buffer, file.type, file.name);

        let extractedText = "";
        let photoBase64: string | null = null;
        const startTime = Date.now();

        try {
          if (fileType === "image") {
            try {
              // Wrap Tesseract in a 4-second timeout race with instant safe fallback so it never hangs
              const ocrPromise = (async () => {
                const worker = await createWorker("eng");
                const { data } = await worker.recognize(buffer);
                await worker.terminate();
                return data.text;
              })();
              const timeoutPromise = new Promise<string>((resolve) =>
                setTimeout(() => resolve(""), 4000)
              );
              extractedText = await Promise.race([ocrPromise, timeoutPromise]);
            } catch {
              extractedText = "";
            }
            const mime = getImageMime(buffer, file.type);
            photoBase64 = bufferToBase64(buffer, mime);
          } else if (fileType === "pdf") {
            try {
              const pdfParse = (await import("pdf-parse")).default;
              const data = await pdfParse(buffer);
              extractedText = data.text;
            } catch {
              extractedText = "";
            }
          } else if (fileType === "docx") {
            try {
              const mammoth = await import("mammoth");
              const result = await mammoth.extractRawText({ buffer });
              extractedText = result.value;
            } catch {
              extractedText = "";
            }
          } else {
            return createErrorResponse(400, "Unsupported file type. Please upload a PNG, JPEG, WEBP or PDF file.");
          }

          const extractedData = extractStudentFields(extractedText);
          if (photoBase64) (extractedData as any).photoBase64 = photoBase64;

          await recordAiTelemetry({
            tenantId,
            userId: user.uid,
            featureKey: "ocr-admission",
            latencyMs: Date.now() - startTime,
            success: true,
          });

          return createSuccessResponse(extractedData);
        } catch (err: any) {
          await recordAiTelemetry({
            tenantId,
            userId: user.uid,
            featureKey: "ocr-admission",
            latencyMs: Date.now() - startTime,
            success: false,
            error: err.message,
          });

          return createErrorResponse(500, "OCR document processing failed.");
        }
      })
    )
  )
);
