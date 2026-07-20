// app/api/v1/settings/route.ts
export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { configurationService } from "@/services/configuration.service"; // 🚀 FIX: configurationService
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const config = await configurationService.getConfigurationViewModel(tenantId);
        
        if (!config) {
          return createSuccessResponse({ schoolName: "", schoolType: "Private", affiliation: "" });
        }

        return createSuccessResponse({
          schoolName: config.schoolName,
          schoolType: config.schoolType,
          affiliation: config.boardName,
          levelsOffered: config.levels,
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
        const current = await configurationService.getConfigurationViewModel(tenantId);
        
        // Use the new saveAndPublishConfiguration method
        await configurationService.saveAndPublishConfiguration({
          schoolProfile: {
            name: body.schoolName || current?.schoolName || "",
            type: body.schoolType || current?.schoolType || "Private",
            curriculumId: body.curriculumId || "custom",
            boardName: body.affiliation || current?.boardName || "Custom Board",
            sections: body.sectionNames || current?.sectionNames || ["A"]
          },
          // Note: This route is mostly for updating profile info, 
          // so we mock an empty academic structure if not provided 
          // to satisfy the validator, though in reality this route 
          // shouldn't be used for full setup anymore.
          academicStructure: {
             levels: current?.levels || [],
             grades: [], // Pass empty if not provided, validator will catch if it's a new setup
             allSubjects: [],
             requiredLabs: [],
             requiredTeachers: {}
          }
        }, tenantId, user.uid);
        
        return createSuccessResponse({ success: true }, { message: "School configuration updated" });
      })
    )
  )
);
