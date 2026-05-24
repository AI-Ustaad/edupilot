import { createWorker } from "tesseract.js";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

function bufferToBase64(buffer: Buffer, mimeType = "image/jpeg"): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function getFileType(buffer: Buffer): "image" | "pdf" | "docx" | "unknown" {
  if (buffer.slice(0, 4).toString() === "%PDF") return "pdf";
  if (buffer.slice(0, 4).toString() === "PK\x03\x04") return "docx";
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return "image";
  if (buffer.slice(0, 8).toString() === "\x89PNG\r\n\x1A\n") return "image";
  return "unknown";
}

function getImageMime(buffer: Buffer): string {
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return "image/jpeg";
  if (buffer.slice(0, 8).toString() === "\x89PNG\r\n\x1A\n") return "image/png";
  return "image/jpeg";
}

function extractStudentFields(text: string) {
  const n = text.replace(/\s+/g, " ");
  return {
    fullName: n.match(/(?:Student Name|Name)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || "",
    fatherName: n.match(/(?:Father|Father Name)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || "",
    cnic: n.match(/\b([0-9]{5}-[0-9]{7}-[0-9]|[0-9]{13})\b/)?.[1] || "",
    dob: n.match(/(?:DOB|Date of Birth)[:\s]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i)?.[1] || "",
    phone: n.match(/\b(03[0-9]{9})\b/)?.[1] || "",
    classGrade: n.match(/(?:Class|Grade)[:\s]*([A-Za-z0-9\s]+)/i)?.[1]?.trim() || "",
    rollNumber: n.match(/(?:Roll No|Roll Number)[:\s]*([0-9]+)/i)?.[1] || "",
    gender: "Male",
    religion: "Islam",
  };
}

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return createApiResponse(400, null, "No file provided");

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileType = getFileType(buffer);

        let extractedText = "";
        let photoBase64: string | null = null;

        if (fileType === "image") {
          const worker = await createWorker("eng");
          const { data } = await worker.recognize(buffer);
          await worker.terminate();
          extractedText = data.text;
          const mime = getImageMime(buffer);
          photoBase64 = bufferToBase64(buffer, mime);
        } else if (fileType === "pdf") {
          const pdfParse = (await import("pdf-parse")).default;
          const data = await pdfParse(buffer);
          extractedText = data.text;
        } else if (fileType === "docx") {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else {
          return createApiResponse(400, null, "Unsupported file type");
        }

        if (!extractedText || extractedText.trim().length < 20) {
          return createApiResponse(400, null, "Could not extract enough text");
        }

        const extractedData = extractStudentFields(extractedText);
        if (photoBase64) (extractedData as any).photoBase64 = photoBase64;

        return createApiResponse(200, { success: true, data: extractedData });
      })
    )
  )
);
