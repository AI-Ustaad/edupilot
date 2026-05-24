import { adminDb } from "@/lib/firebase-admin";
import { getPlanLimits } from "@/lib/subscription";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("students")
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .get();
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return createApiResponse(200, students);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const limits = await getPlanLimits(tenantId);
        const countSnapshot = await adminDb
          .collection("students")
          .where("tenantId", "==", tenantId)
          .count()
          .get();
        const currentCount = countSnapshot.data().count;

        if (currentCount >= limits.students) {
          return createApiResponse(403, null, `Student limit reached (${limits.students}). Please upgrade your plan.`);
        }

        const body = await req.json();
        const docRef = await adminDb.collection("students").add({
          ...body,
          tenantId,
          createdBy: user.uid,
          createdAt: new Date(),
        });

        return createApiResponse(201, { id: docRef.id }, "Student added");
      })
    )
  )
);
