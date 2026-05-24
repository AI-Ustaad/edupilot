// app/api/settings/route.ts
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      const doc = await adminDb.collection("settings").doc(tenantId).get();
      const data = doc.data() || { classes: [], sections: [], subjects: [], periods: [] };
      return createApiResponse(200, data);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin") {
        return createApiResponse(403, null, "Forbidden");
      }

      try {
        const { classes, sections, subjects, periods } = await req.json();

        await adminDb.collection("settings").doc(tenantId).set(
          {
            classes: classes || [],
            sections: sections || [],
            subjects: subjects || [],
            periods: periods || [],
            updatedAt: new Date(),
            updatedBy: user.uid,
          },
          { merge: true }
        );

        // Sync sections collection for ClassesDirectory
        const batch = adminDb.batch();
        const existing = await adminDb.collection("sections").where("tenantId", "==", tenantId).get();
        existing.docs.forEach(doc => batch.delete(doc.ref));

        for (const sec of sections) {
          const ref = adminDb.collection("sections").doc();
          batch.set(ref, {
            classGrade: sec.classGrade?.toUpperCase(),
            sectionName: sec.sectionName?.toUpperCase(),
            incharge: sec.incharge || "",
            tenantId,
            createdAt: new Date(),
          });
        }
        await batch.commit();

        return createApiResponse(200, null, "Settings saved successfully");
      } catch (err: any) {
        console.error("Error saving settings:", err);
        return createApiResponse(500, null, "Failed to save settings");
      }
    })
  )
);
