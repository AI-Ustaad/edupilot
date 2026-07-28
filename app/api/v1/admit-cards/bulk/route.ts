export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createErrorResponse } from "@/lib/api/response";
import { AdmitCardService } from "@/services/admit-card.service";
import type { TenantContext } from "@/types/api";
import jsPDF from "jspdf";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.exams.generate)(async (req: Request, { tenantId }: TenantContext) => {
        const { classGrade, section, examTerm, schoolName } = await req.json();
        if (!classGrade || !section || !examTerm) {
          return createErrorResponse(400, "Missing fields");
        }

        const service = new AdmitCardService();
        const buffer = await service.generateBulkAdmitCards(tenantId, classGrade, section, examTerm, schoolName);

        return new Response(buffer as BodyInit, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="admit_cards_${classGrade}_${section}.pdf"`,
          },
        });
      })
    )
  )
);
