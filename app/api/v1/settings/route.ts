export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SectionRepository } from "@/repositories/section.repository";
import { SettingsRepository } from "@/repositories/settings.repository";
import type { TenantContext } from "@/types/api";

const settingsRepo = new SettingsRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const config = await settingsRepo.getConfig(tenantId);
        if (!config) {
          return createSuccessResponse({ classes: [], subjects: [] });
        }
        return createSuccessResponse(config);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const { classes, subjects } = body;

        await settingsRepo.updateConfig(tenantId, {
          classes: classes || [],
          subjects: subjects || [],
        });

        if (classes && Array.isArray(classes)) {
          const sectionRepo = new SectionRepository();
          await sectionRepo.deleteAllForTenant(tenantId);

          const newSections: any[] = [];
          classes.forEach((cls: any) => {
            if (cls.name && cls.sections && Array.isArray(cls.sections)) {
              cls.sections.forEach((secName: string) => {
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
        }

        return createSuccessResponse(null, { message: "Settings updated" });
      })
    )
  )
);
