import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

const CLASS_MAP: Record<string, string> = {
  "Nursery": "Prep",
  "Prep": "Class 1",
  "Class 1": "Class 2",
  "Class 2": "Class 3",
  "Class 3": "Class 4",
  "Class 4": "Class 5",
  "Class 5": "Class 6",
  "Class 6": "Class 7",
  "Class 7": "Class 8",
  "Class 8": "Class 9",
  "Class 9": "Class 10",
  "Class 10": "Graduated",
};

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { fromClass, toClass } = await req.json();
        let query = adminDb.collection("students").where("tenantId", "==", tenantId);
        if (fromClass) query = query.where("classGrade", "==", fromClass);
        const snapshot = await query.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
          const currentClass = doc.data().classGrade;
          const nextClass = toClass || CLASS_MAP[currentClass];
          if (nextClass && nextClass !== "Graduated") {
            batch.update(doc.ref, { classGrade: nextClass });
          }
        });
        await batch.commit();
        return createApiResponse(200, { promoted: snapshot.size }, "Promotion completed");
      })
    )
  )
);
