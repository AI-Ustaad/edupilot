import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";
import { Timestamp } from "firebase-admin/firestore";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { students } = await req.json();
        if (!Array.isArray(students) || students.length === 0) {
          return createApiResponse(400, null, "No students provided");
        }

        const batch = adminDb.batch();
        for (const s of students) {
          const ref = adminDb.collection("students").doc();
          batch.set(ref, {
            ...s,
            tenantId,
            createdBy: user.uid,
            createdAt: Timestamp.now(),
            rollNumber: Number(s.rollNumber) || 0,
          });
        }
        await batch.commit();
        return createApiResponse(201, { count: students.length }, "Import complete");
      })
    )
  )
);
