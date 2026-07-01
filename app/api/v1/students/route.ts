export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

// ✅ Argument کے ساتھ Service initialize کریں
const studentService = new StudentService(new StudentRepository());

export const GET = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.view, async (req, context) => {
    const tenantId = context.user.tenantId;
    const students = await studentService.listStudents(tenantId, 1, 9999);
    return successResponse(students.data || students, "Students fetched");
  })
);

export const POST = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.create, async (req, context) => {
    const tenantId = context.user.tenantId;
    let body;
    try { 
      body = await req.json(); 
    } catch { 
      return errorResponse("Invalid JSON", 400); 
    }
    
    if (!body.fullName || !body.classGrade) {
      return errorResponse("Name and Class required", 400);
    }
    
    body.tenantId = tenantId;
    body.createdBy = context.user.uid;
    
    const student = await studentService.createStudent(body, tenantId);
    return successResponse(student, "Student admitted", 201);
  })
);
