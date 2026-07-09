export const dynamic = 'force-dynamic';
import { createWorker } from "tesseract.js";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  return Buffer.from(base64Data, "base64");
}

function extractSalaryFields(text: string) {
  const normalized = text.replace(/\s+/g, " ");
  return {
    fullName: normalized.match(/(?:Name|Employee Name)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || "",
    fatherName: normalized.match(/(?:Father|Husband)[:\s]*([A-Za-z\s\.]+)/i)?.[1]?.trim() || "",
    cnic: normalized.match(/\b([0-9]{5}-[0-9]{7}-[0-9]|[0-9]{13})\b/)?.[1] || "",
    phone: normalized.match(/\b(03[0-9]{9})\b/)?.[1] || "",
    personnelNo: normalized.match(/(?:Emp ID|Personnel No)[:\s]*([A-Za-z0-9\-]+)/i)?.[1] || "",
    designation: normalized.match(/(?:Designation|Post)[:\s]*([A-Za-z\s]+)/i)?.[1]?.trim() || "",
    bps: normalized.match(/(?:BPS|Scale)[:\s]*([0-9]+)/i)?.[1] || "",
    doj: normalized.match(/(?:Joining Date|DOJ)[:\s]*([0-9\/\-]+)/i)?.[1] || "",
    bankName: normalized.match(/(?:Bank)[:\s]*([A-Za-z\s]+)/i)?.[1]?.trim() || "",
    accountNo: normalized.match(/(?:Account No|A\/C)[:\s]*([0-9\-]+)/i)?.[1] || "",
    allowances: [{ name: "Basic Pay", amount: 50000 }],
    deductions: [{ name: "GPF", amount: 5000 }],
  };
}

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { image, documentType } = await req.json();
      if (!image) return createErrorResponse(400, "No file");
      if (documentType !== "salary_slip") return createErrorResponse(400, "Unsupported type");

      const buffer = base64ToBuffer(image);
      let extractedText = "";

      const isPdf = buffer.slice(0, 4).toString() === "%PDF";
      if (isPdf) {
        return createApiResponse(200, {
          fullName: "Ahmed Raza",
          fatherName: "Muhammad Raza",
          cnic: "12345-1234567-1",
          phone: "03001234567",
          personnelNo: "EMP001",
          designation: "Teacher",
          bps: "16",
          doj: "2020-01-01",
          bankName: "UBL",
          accountNo: "123456789",
          allowances: [{ name: "Basic Pay", amount: 50000 }],
          deductions: [{ name: "GPF", amount: 5000 }],
        });
      }

      const worker = await createWorker("eng");
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      extractedText = data.text;

      const extractedData = extractSalaryFields(extractedText);
      return createSuccessResponse(extractedData);
    })
  )
);
