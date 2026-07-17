// app/api/v1/settings/curriculum/route.ts
export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { SchoolConfigurationSchema } from "@/lib/validation/school-configuration.schema";
import { schoolConfigurationService } from "@/services/school-configuration.service";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.curriculum.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const current = await schoolConfigurationService.getConfiguration(tenantId);
        const parsed = SchoolConfigurationSchema.safeParse({
          schoolName: body.schoolName || current.school.name,
          schoolType: body.schoolType || current.school.type,
          curriculumId: body.curriculumId || body.curriculum || current.school.curriculumId,
          levels: body.levels || current.academicStructure.levels,
          sectionNames: body.sectionNames || current.academicStructure.sectionNames,
        });
        if (!parsed.success) return createErrorResponse(400, "Invalid school configuration", parsed.error.errors);
        const configuration = await schoolConfigurationService.saveConfiguration(parsed.data, tenantId, user.uid);
        return createSuccessResponse(configuration, { message: "Curriculum applied through School Configuration." });
      })
    )
  )
);
