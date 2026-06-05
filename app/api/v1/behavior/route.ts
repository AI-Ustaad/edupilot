export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { studentId, points, reason } = await req.json();
        if (!studentId || points === undefined || !reason) {
          return createApiResponse(400, null, "Missing fields");
        }

        // لاگ میں اندراج
        await adminDb.collection("behavior_logs").add({
          studentId,
          points,
          reason,
          recordedBy: user.uid,
          tenantId,
          createdAt: new Date(),
        });

        // طالب علم کے مجموعی پوائنٹس اپ ڈیٹ کریں
        const studentRef = adminDb.collection("students").doc(studentId);
        const studentDoc = await studentRef.get();
        if (studentDoc.exists) {
          const currentPoints = studentDoc.data()?.behaviorPoints || 0;
          await studentRef.update({ behaviorPoints: currentPoints + points });
        }

        return createApiResponse(200, { success: true });
      })
    )
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      if (!studentId) return createApiResponse(400, null, "Student ID required");

      const logsSnap = await adminDb
        .collection("behavior_logs")
        .where("studentId", "==", studentId)
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      const logs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, logs);
    })
  )
);
