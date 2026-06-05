export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId }: TenantContext) => {
        // تمام طلبہ
        const studentsSnap = await adminDb
          .collection("students")
          .where("tenantId", "==", tenantId)
          .get();

        const riskStudents: any[] = [];

        for (const doc of studentsSnap.docs) {
          const student = { id: doc.id, ...doc.data() };
          
          // آخری 30 دنوں کی حاضری کا حساب
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const attSnap = await adminDb
            .collection("attendance")
            .where("studentId", "==", student.id)
            .where("tenantId", "==", tenantId)
            .where("date", ">=", thirtyDaysAgo.toISOString().slice(0, 10))
            .get();

          let present = 0, total = 0;
          attSnap.forEach(d => {
            total++;
            if (d.data().status === "Present") present++;
          });
          const attendancePct = total > 0 ? (present / total) * 100 : 100;

          // تازہ ترین مارکس
          const marksSnap = await adminDb
            .collection("marks")
            .where("studentId", "==", student.id)
            .where("tenantId", "==", tenantId)
            .orderBy("updatedAt", "desc")
            .limit(1)
            .get();

          let marksPct = 100;
          if (!marksSnap.empty) {
            const m = marksSnap.docs[0].data();
            marksPct = m.totalMarks > 0 ? (m.marksObtained / m.totalMarks) * 100 : 100;
          }

          // شرط: حاضری < 60% یا مارکس < 40%
          if (attendancePct < 60 || marksPct < 40) {
            riskStudents.push({
              ...student,
              attendance: Math.round(attendancePct),
              marks: Math.round(marksPct),
              riskReason: attendancePct < 60 ? "Low Attendance" : "Low Marks",
            });
          }
        }

        return createApiResponse(200, riskStudents);
      })
    )
  )
);
