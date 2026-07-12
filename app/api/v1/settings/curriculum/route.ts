// app/api/v1/settings/curriculum/route.ts
export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.curriculum.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { classes, subjects, schoolType, curriculum, levels } = await req.json();

        if (!classes || !subjects) {
          return createErrorResponse(400, "Classes and Subjects are required");
        }

        const batch = adminDb.batch();

        const settingsRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config");
        batch.set(settingsRef, {
          classes,
          subjects,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        const generalRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("general");
        batch.set(generalRef, {
          schoolType: schoolType,
          affiliation: curriculum,
          levelsOffered: levels,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        const sectionsRef = adminDb.collection("sections");
        const oldSections = await sectionsRef.where("tenantId", "==", tenantId).get();
        oldSections.docs.forEach(doc => batch.delete(doc.ref));

        classes.forEach((cls: any) => {
          if (cls.name) {
            const newSecRef = sectionsRef.doc();
            batch.set(newSecRef, {
              tenantId,
              classGrade: cls.name,
              sectionName: "A",
              createdAt: new Date().toISOString()
            });
          }
        });

        await batch.commit();

        logger.info("Curriculum applied", { metadata: { tenantId, userId: user.uid, classCount: classes.length } });

        return createSuccessResponse(null, {
          message: "Curriculum applied successfully! Classes and Subjects have been updated."
        });
      })
    )
  )
);
