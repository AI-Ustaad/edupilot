export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { CertificateService } from "@/services/certificate.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.certificates.generate)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const type = (searchParams.get("type") || "degree") as "degree" | "transfer";

        if (!studentId) return createErrorResponse(400, "Missing studentId");

        const service = new CertificateService();
        const pdfBuffer = await service.generateCertificate(tenantId, studentId, type);

        return new Response(pdfBuffer as BodyInit, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="certificate_${studentId}.pdf"`,
          },
        });
      })
    )
  )
);
