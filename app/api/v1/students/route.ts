export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

// ✅ Argument واپس اضافے کیا گیا ہے
const studentService = new StudentService(new StudentRepository());

export const GET = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.view, async (req, context) => {
    const tenantId = context.user.tenantId;
    const id = context.params?.id;

    if (!id) return errorResponse("Student ID is required", 400);

    // ✅ پرانا Method استعمال کیا گیا ہے
    const student = await studentService.getStudentById(id, tenantId);
    
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

    // ✅ پرانا Method استعمال کیا گیا ہے
    const updatedStudent = await studentService.updateStudent(id, body, tenantId);
    return successResponse(updatedStudent, "Student updated");
  })
);

export const DELETE = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.delete, async (req, context) => {
    const tenantId = context.user.tenantId;
    const id = context.params?.id;
    
    if (!id) return errorResponse("Student ID is required", 400);

    // ✅ پرانا Method استعمال کیا گیا ہے
    await studentService.deleteStudent(id, tenantId);
    return successResponse(null, "Student deleted");
  })
);
