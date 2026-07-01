export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

// ✅ Constructor میں Argument ہٹا دیا گیا
const studentService = new StudentService();

export const GET = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.view, async (req, context) => {
    const tenantId = context.user.tenantId;
    const id = context.params?.id;

    if (!id) return errorResponse("Student ID is required", 400);

    // ✅ نئی Method استعمال کی گئی ہے
    const student = await studentService.getById(tenantId, id);
    
    if (!student) {
      return errorResponse("Student not found", 404);
    }
    
    return successResponse(student, "Student fetched");
  })
);

export const PUT = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.update, async (req, context) => {
    const tenantId = context.user.tenantId;
    const id = context.params?.id;
    
    if (!id) return errorResponse("Student ID is required", 400);

    let body;
    try { body = await req.json(); } catch { return errorResponse("Invalid JSON", 400); }

    // ✅ نئی Method استعمال کی گئی ہے
    const updatedStudent = await studentService.update(tenantId, id, body);
    return successResponse(updatedStudent, "Student updated");
  })
);

export const DELETE = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.delete, async (req, context) => {
    const tenantId = context.user.tenantId;
    const id = context.params?.id;
    
    if (!id) return errorResponse("Student ID is required", 400);

    // ✅ نئی Method استعمال کی گئی ہے
    await studentService.delete(tenantId, id);
    return successResponse(null, "Student deleted");
  })
);
