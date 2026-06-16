import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { withPermission } from "@/lib/auth/withPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// Initialize Service (Dependency Injection)
const studentService = new StudentService(new StudentRepository());

// 🟢 GET: Fetch Students List (Protected by students.view)
export const GET = withPermission(PERMISSIONS.students.view, async (req: Request, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    
    // Using listStudents from your existing service
    const students = await studentService.listStudents(tenantId, 1, 9999); 
    
    return successResponse(students, "Students fetched successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch students", 500);
  }
});

// 🔵 POST: Add New Student (Protected by students.create)
export const POST = withPermission(PERMISSIONS.students.create, async (req: Request, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const body = await req.json();
    
    // The service handles validation, database creation, and event logging
    const newStudent = await studentService.create(body, tenantId);
    
    return successResponse(newStudent, "Student enrolled successfully", 201);
  } catch (error: any) {
    // If Zod validation fails in the service, return 400 Bad Request
    const status = error.message?.includes("Validation") ? 400 : 500;
    return errorResponse(error.message || "Failed to enroll student", status);
  }
});
