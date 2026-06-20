export const dynamic = 'force-dynamic';
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { successResponse } from "@/lib/utils/api-response";

const studentService = new StudentService(new StudentRepository());

export const GET = withAuthAndPermission(
  PERMISSIONS.students.view,
  async (req: Request, context: any) => {
    const tenantId = context.user.tenantId;
    const students = await studentService.listStudents(tenantId, 1, 9999);
    return successResponse(students.data, "Students fetched successfully");
  }
);

export const POST = withAuthAndPermission(
  PERMISSIONS.students.create,
  async (req: Request, context: any) => {
    const tenantId = context.user.tenantId;
    const body = await req.json();
    const student = await studentService.createStudent(body, tenantId);
    return successResponse(student, "Student enrolled successfully", 201);
  }
);
