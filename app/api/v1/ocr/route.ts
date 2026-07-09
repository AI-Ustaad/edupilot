export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { image, documentType } = await req.json();
      if (!image) return createErrorResponse(400, "No file");
      if (documentType !== "salary_slip") return createErrorResponse(400, "Unsupported type");

      const extractedData = {
        fullName: "John Doe",
        fatherName: "Smith",
        cnic: "12345-6789012-3",
        phone: "03001234567",
        allowances: [{ name: "Basic Pay", amount: 18910 }],
        deductions: [{ name: "GPF", amount: 3340 }],
      };
      return createSuccessResponse(extractedData);
    })
  )
);
