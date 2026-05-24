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

        const studentsSnap = await adminDb
          .collection("students")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", classGrade)
          .where("section", "==", section)
          .get();

        const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        let emailsSent = 0;

        for (const student of students) {
          const parentEmail = student.parentEmail || student.parent_email || student.email;
          if (parentEmail) {
            const studentName = student.fullName || student.name || "Your child";
            await sendEmail(
              parentEmail,
              `Exam Results Published - ${term}`,
              `<p>Dear Parent,</p><p>Results for <strong>${studentName}</strong> in <strong>${term}</strong> are now available.</p>`
            );
            emailsSent++;
          }
        }

        return createApiResponse(200, { studentsFound: students.length, emailsSent });
      })
    )
  )
);
