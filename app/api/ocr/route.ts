import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { image, documentType } = await req.json();
      if (!image) return createApiResponse(400, null, "No file");
      if (documentType !== "salary_slip") return createApiResponse(400, null, "Unsupported type");

      const extractedData = {
        fullName: "John Doe",
        fatherName: "Smith",
        cnic: "12345-6789012-3",
        phone: "03001234567",
        allowances: [{ name: "Basic Pay", amount: 18910 }],
        deductions: [{ name: "GPF", amount: 3340 }],
      };
      return createApiResponse(200, extractedData);
    })
  )
);
