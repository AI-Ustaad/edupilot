import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["parent"])(async (req: Request, { tenantId, user }: TenantContext) => {
        // والدین کے بچوں کی IDs حاصل کریں
        const parentDoc = await adminDb.collection("parents").doc(user.uid).get();
        const childIds: string[] = parentDoc.data()?.studentIds || [];
        if (childIds.length === 0) {
          return createApiResponse(200, { children: [] });
        }

        // بچوں کی معلومات لائیں
        const studentsSnap = await adminDb
          .collection("students")
          .where("tenantId", "==", tenantId)
          .where("__name__", "in", childIds)
          .get();
        const children = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ہر بچے کے لیے آج کی حاضری اور تازہ ترین مارکس حاصل کریں
        const enriched = await Promise.all(
          children.map(async (child: any) => {
            // آج کی تاریخ
            const today = new Date().toISOString().slice(0, 10);

            // آج کی حاضری
            const attSnap = await adminDb
              .collection("attendance")
              .where("studentId", "==", child.id)
              .where("date", "==", today)
              .where("tenantId", "==", tenantId)
              .limit(1)
              .get();
            const todayAttendance = attSnap.empty ? "Not marked" : attSnap.docs[0].data().status;

            // تازہ ترین مارکس (آخری 1 ریکارڈ)
            const marksSnap = await adminDb
              .collection("marks")
              .where("studentId", "==", child.id)
              .where("tenantId", "==", tenantId)
              .orderBy("updatedAt", "desc")
              .limit(1)
              .get();
            const latestMarks = marksSnap.empty ? null : marksSnap.docs[0].data();

            return {
              ...child,
              todayAttendance,
              latestMarks,
            };
          })
        );

        // حالیہ نوٹس/ہوم ورک (پورے اسکول کے)
        const noticesSnap = await adminDb
          .collection("homework")
          .where("tenantId", "==", tenantId)
          .orderBy("createdAt", "desc")
          .limit(5)
          .get();
        const notices = noticesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        return createApiResponse(200, { children: enriched, notices });
      })
    )
  )
);
