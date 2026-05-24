import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const date = searchParams.get("date");
      const classGrade = searchParams.get("classGrade");
      const section = searchParams.get("section");

      let query = adminDb.collection("attendance").where("tenantId", "==", tenantId);
      if (date) query = query.where("date", "==", date);
      if (classGrade) query = query.where("classGrade", "==", classGrade);
      if (section) query = query.where("section", "==", section);

      const snapshot = await query.orderBy("createdAt", "desc").get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return createApiResponse(200, data);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const records = await req.json();
        if (!Array.isArray(records) || records.length === 0) {
          return createApiResponse(400, null, "No records provided");
        }

        const batch = adminDb.batch();
        for (const record of records) {
          const docRef = adminDb.collection("attendance").doc();
          batch.set(docRef, {
            ...record,
            tenantId,
            createdBy: user.uid,
            createdAt: dbTimestamp.now(),
          });
        }
        await batch.commit();

        for (const record of records) {
          const studentDoc = await adminDb.collection("students").doc(record.studentId).get();
          const student = studentDoc.data();
          if (student?.parentEmail) {
            sendEmail(
              student.parentEmail,
              `Attendance Update - ${record.date}`,
              `<p>Your child <strong>${student.fullName || student.name}</strong> was marked <strong>${record.status}</strong> on ${record.date}.</p>`
            ).catch(console.error);
          }
        }

        return createApiResponse(200, null, "Attendance saved");
      })
    )
  )
);
