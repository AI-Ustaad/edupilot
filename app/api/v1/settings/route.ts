export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SectionRepository } from "@/repositories/section.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const doc = await adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config').get();
        if (!doc.exists) {
          return createSuccessResponse({ classes: [], subjects: [] });
        }
        return createSuccessResponse(doc.data());
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

        await adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config').set({
          classes: classes || [],
          subjects: subjects || [],
          updatedAt: new Date().toISOString()
        }, { merge: true });

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
