export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { curriculumMap } from "@/lib/curriculum-data";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { schoolType, level } = await req.json();
        const curriculum = curriculumMap[schoolType as keyof typeof curriculumMap]?.[level];
        if (!curriculum) return createErrorResponse(400, "Invalid school type or level");

        const settingsRef = adminDb.collection("settings").doc(tenantId);
        const existingData = (await settingsRef.get()).data() || {};
        const uniqueClasses = [...new Set(curriculum.classes)];
        const uniqueSubjects = [...new Set(curriculum.subjects)];

        await settingsRef.set({
          classes: uniqueClasses,
          subjects: uniqueSubjects,
          sections: existingData.sections || [],
          periods: existingData.periods || [],
          schoolType,
          schoolLevel: level,
          curriculumLoadedAt: new Date(),
        }, { merge: true });

        const sectionsRef = adminDb.collection("sections");
        const existing = await sectionsRef.where("tenantId", "==", tenantId).get();
        const batch = adminDb.batch();
        existing.docs.forEach(d => batch.delete(d.ref));

        for (const cls of uniqueClasses) {
          const ref = sectionsRef.doc();
          batch.set(ref, {
            classGrade: cls,
            sectionName: "A",
            incharge: "",
            tenantId,
            createdAt: new Date(),
          });
        }
        await batch.commit();

        return createSuccessResponse({
          classes: uniqueClasses,
          subjects: uniqueSubjects,
          sectionsCreated: uniqueClasses.length,
        });
      })
    )
  )
);
