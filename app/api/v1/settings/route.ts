// app/api/v1/settings/route.ts
export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { configurationService } from "@/services/configuration.service"; // 🚀 FIX: configurationService
import { ConfigurationRepository } from "@/repositories/configuration.repository";
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
        const repo = new ConfigurationRepository();
        const existingConfig = await repo.getConfiguration(tenantId);

        const currentGrades = existingConfig?.academic?.classes?.length
          ? existingConfig.academic.classes.map((c) => ({
              id: c.id,
              name: c.name,
              level: c.level,
              schemeOfStudy: {
                subjects: (c.subjects || []).map((s) => ({ name: s })),
              },
            }))
          : [
              {
                id: "grade_1",
                name: "Class 1",
                level: "Primary",
                schemeOfStudy: { subjects: [{ name: "English" }, { name: "Mathematics" }] },
              },
            ];

        const currentSubjects = existingConfig?.academic?.subjects?.length
          ? existingConfig.academic.subjects.map((s) =>
              typeof s === "string" ? { id: s, name: s } : s
            )
          : [{ id: "sub_eng", name: "English" }, { id: "sub_math", name: "Mathematics" }];

        const currentLevels = existingConfig?.academic?.levels?.length
          ? existingConfig.academic.levels
          : ["Primary"];

        await configurationService.saveAndPublishConfiguration(
          {
            schoolProfile: {
              name: body.schoolName || existingConfig?.school?.name || current?.schoolName || "",
              type: body.schoolType || existingConfig?.school?.type || current?.schoolType || "Private",
              curriculumId: body.curriculumId || existingConfig?.school?.curriculumId || "custom",
              boardName: body.affiliation || existingConfig?.school?.boardName || current?.boardName || "Custom Board",
              sections: body.sectionNames || existingConfig?.academic?.sectionNames || current?.sectionNames || ["A"],
            },
            academicStructure: {
              levels: currentLevels,
              grades: currentGrades,
              allSubjects: currentSubjects,
              requiredLabs: existingConfig?.academic?.requiredLabs || [],
              requiredTeachers: existingConfig?.academic?.requiredTeachers || {},
            },
          },
          tenantId,
          user.uid
        );

        return createSuccessResponse({ success: true }, { message: "School configuration updated" });
      })
    )
  )
);
