// app/api/v1/settings/curriculum/route.ts
export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logger } from "@/lib/logger/logger";
import { SettingsRepository } from "@/repositories/settings.repository";
import { SectionRepository } from "@/repositories/section.repository";
import type { TenantContext } from "@/types/api";

const settingsRepo = new SettingsRepository();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.curriculum.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { classes, subjects, schoolType, curriculum, levels } = await req.json();

        if (!classes || !subjects) {
          return createErrorResponse(400, "Classes and Subjects are required");
        }

        // Update settings via repository
        await settingsRepo.updateConfig(tenantId, { classes, subjects });
        await settingsRepo.updateGeneral(tenantId, {
          schoolType,
          affiliation: curriculum,
          levelsOffered: levels,
        });

        // Rebuild sections
        const sectionRepo = new SectionRepository();
        await sectionRepo.deleteAllForTenant(tenantId);

        const newSections: any[] = [];
        classes.forEach((cls: any) => {
          if (cls.name) {
            const sections = Array.isArray(cls.sections) ? cls.sections : ["A"];
            sections.forEach((secName: string) => {
              newSections.push({
                tenantId,
                classGrade: cls.name,
                sectionName: secName,
                incharge: '',
                deleted: false,
              });
            });
          }
        });

        if (newSections.length > 0) {
          await sectionRepo.bulkCreate(newSections, tenantId);
        }

        logger.info("Curriculum applied", { metadata: { tenantId, userId: user.uid, classCount: classes.length } });

        return createSuccessResponse(null, {
          message: "Curriculum applied successfully! Classes and Subjects have been updated."
        });
      })
    )
  )
);
