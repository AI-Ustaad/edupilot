// app/api/v1/settings/route.ts
export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { configurationAppService } from "@/services/configuration.application.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const config = await configurationAppService.getConfiguration(tenantId);
        
        if (!config) {
          return createSuccessResponse({ schoolName: "", schoolType: "Private", affiliation: "" });
        }

        return createSuccessResponse({
          schoolName: config.school.name,
          schoolType: config.school.type,
          affiliation: config.school.boardName,
          levelsOffered: config.academic.levels,
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
        const current = await configurationAppService.getConfiguration(tenantId);
        
        // Use the new saveAndPublishConfiguration method
        const configuration = await configurationAppService.saveAndPublishConfiguration({
          schoolName: body.schoolName || current?.school.name || "",
          schoolType: body.schoolType || current?.school.type || "Private",
          curriculumId: body.curriculumId || current?.school.curriculumId || "federal",
          levels: body.levels || current?.academic.levels || [],
          sectionNames: body.sectionNames || current?.academic.sectionNames || ["A"],
        }, tenantId, user.uid);
        
        return createSuccessResponse(configuration, { message: "School configuration updated" });
      })
    )
  )
);
