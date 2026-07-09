export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("id");
        if (!studentId) {
          return createErrorResponse(400, "Student ID is required");
        }

        const studentDoc = await adminDb.collection("students").doc(studentId).get();
        if (!studentDoc.exists || studentDoc.data()?.tenantId !== tenantId) {
          return createErrorResponse(404, "Student not found");
        }

        const collections = ["attendance", "marks", "fees", "submissions", "quiz_submissions"];
        const batch = adminDb.batch();

        // ہر متعلقہ کلیکشن سے ڈیٹا حذف کریں
        for (const col of collections) {
          const snap = await adminDb
            .collection(col)
            .where("studentId", "==", studentId)
            .where("tenantId", "==", tenantId)
            .get();
          snap.docs.forEach(doc => batch.delete(doc.ref));
        }

        // خود طالب علم کا دستاویز بھی حذف کریں
        batch.delete(studentDoc.ref);
        await batch.commit();

        // آڈٹ لاگ میں ریکارڈ کریں
        await adminDb.collection("logs").add({
          action: "STUDENT_DELETED",
          userId: user.uid,
          tenantId,
          entityId: studentId,
          entityType: "student",
          metadata: { name: studentDoc.data()?.fullName || studentDoc.data()?.name },
          createdAt: new Date(),
        });

        return createSuccessResponse(null, { message: "Student and all related data deleted successfully" });
      })
    )
  )
);
