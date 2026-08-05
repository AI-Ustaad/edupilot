export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AdmissionsService } from "@/services/AdmissionsService";
import { AdmissionApprovalSchema } from "@/validators/admission";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.admissions.approve)(async (req: Request, { tenantId, user }: TenantContext) => {
        const validatedData = AdmissionApprovalSchema.parse(await req.json());

        const service = new AdmissionsService();

        if (validatedData.status === "approved") {
          await service.approve(tenantId, validatedData.studentId, user.uid);
        } else {
          await service.reject(tenantId, validatedData.studentId, user.uid);
        }

        return createSuccessResponse(null, { message: `Admission ${validatedData.status} successfully` });
      })
    )
  )
);
