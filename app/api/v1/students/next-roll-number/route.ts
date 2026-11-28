export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse } from "@/lib/api/response";

// B23: the smallest unused roll number for the tenant, so the Add Student
// form can pre-fill it. The same value is the server-side backstop in
// StudentService.create — a blank roll number is auto-assigned on save.
export const GET = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.view, async (req, context) => {
    const service = new StudentService();
    const rollNumber = await service.getNextRollNumber(context.user.tenantId);
    return createSuccessResponse({ rollNumber }, { message: "Next available roll number" });
  })
);
