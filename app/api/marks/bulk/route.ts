import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { classGrade, section, term } = await req.json();
        if (!classGrade || !section || !term) {
          return createApiResponse(400, null, "Missing parameters");
        }

        const studentsSnap = await adminDb.collection("students")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", classGrade)
          .where("section", "==", section)
          .get();

        const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        const parentEmails: { email: string; studentName: string }[] = [];

        for (const student of students) {
          const studentName = student.fullName || student.name || "Unknown Student";
          const parentEmail = student.parentEmail || student.parent_email || student.email;
          if (parentEmail) {
            parentEmails.push({ email: parentEmail, studentName });
          }
        }

        // والدین کو ای میل
        for (const parent of parentEmails) {
          sendEmail(
            parent.email,
            `Exam Results Published - ${term}`,
            `<p>Dear Parent,</p><p>Results for <strong>${parent.studentName}</strong> in <strong>${term}</strong> are now available.</p>`
          ).catch(console.error);
        }

        return createApiResponse(200, {
          students: students.length,
          emailsSent: parentEmails.length,
        });
      })
    )
  )
);
