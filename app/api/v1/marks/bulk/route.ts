export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { MarksService } from "@/services/marks.service";
import { sendEmail } from "@/lib/email";
import type { TenantContext } from "@/types/api";

const marksService = new MarksService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.manage)(async (req: Request, { tenantId }: TenantContext) => {
        const { classGrade, section, term } = await req.json();
        if (!classGrade || !section || !term) {
          return createApiResponse(400, null, "Missing parameters");
        }

        const students = await marksService.listMarks(tenantId, { classGrade, section, term });
        const studentIds = students.map(m => m.studentId);

        const db = (marksService as any).repo.getDb();
        const studentsSnap = await db.collection("students")
          .where("tenantId", "==", tenantId)
          .where("__name__", "in", studentIds.slice(0, 30))
          .get();

        const parentContacts = studentsSnap.docs
          .map(doc => doc.data())
          .filter((s: any) => s.parentEmail || s.parent_email)
          .map((s: any) => ({
            email: s.parentEmail || s.parent_email,
            studentName: s.fullName || s.name || "Your child",
          }));

        for (const parent of parentContacts) {
          sendEmail(
            parent.email,
            `Exam Results Published - ${term}`,
            `<p>Dear Parent,</p><p>Results for <strong>${parent.studentName}</strong> in <strong>${term}</strong> are now available.</p>`
          ).catch(console.error);
        }

        return createApiResponse(200, {
          students: students.length,
          emailsSent: parentContacts.length,
        });
      })
    )
  )
);
