export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { ExamService } from "@/services/ai/exam.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

const examService = new ExamService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.exams.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { bookTitle, chapters, classGrade, subject, questionTypes, totalMarks } = await req.json();
        if (!classGrade || !subject) {
          return createErrorResponse(400, "Missing required fields (classGrade, subject)");
        }

        const result = await examService.generateExam(
          {
            className: classGrade,
            subject,
            topic: chapters?.join(", ") || "General",
            difficulty: "medium",
          },
          tenantId,
          user.uid
        );

        return createSuccessResponse(result);
      })
    )
  )
);
