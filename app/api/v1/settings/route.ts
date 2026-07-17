export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { schoolConfigurationService } from "@/services/school-configuration.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const config = await schoolConfigurationService.getConfiguration(tenantId);
        return createSuccessResponse({
          ...config,
          // Retained until module-specific consumers move to academicStructure.
          classes: config.academicStructure.classes.map((item) => ({ name: item.name, sections: config.academicStructure.sectionNames })),
          subjects: config.academicStructure.subjects,
        });
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const current = await schoolConfigurationService.getConfiguration(tenantId);
        // Backward-compatible legacy endpoint. Structural writes are normalized through the central engine.
        const configuration = await schoolConfigurationService.saveConfiguration({
          schoolName: body.schoolName || current.school.name,
          schoolType: body.schoolType || current.school.type,
          curriculumId: body.curriculumId || current.school.curriculumId,
          levels: body.levels || current.academicStructure.levels,
          sectionNames: body.sectionNames || current.academicStructure.sectionNames,
        }, tenantId, user.uid);
        return createSuccessResponse(configuration, { message: "School configuration updated" });
      })
    )
  )
);
