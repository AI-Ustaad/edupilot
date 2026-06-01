import { invalidateCache } from "@/lib/cache";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { logAction } from "@/lib/audit";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';

interface WithTenantContext {
  tenantId: string;
  user: { uid: string; email: string; role: string; tenantId: string; };
}

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const service = new StudentService(new StudentRepository());
        const student = await service.getStudentById(id, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
        if (!student) return createApiResponse(404, null, "Student not found");
    await invalidateCache(`dashboard:${tenantId}`);
        return createApiResponse(200, student);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const body = await req.json();
        const service = new StudentService(new StudentRepository());
        await service.updateStudent(id, body, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
        return createApiResponse(200, null, "Student updated successfully");
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.delete)(async (req: Request, { tenantId, user }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const service = new StudentService(new StudentRepository());
        const student = await service.getStudentById(id, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
        if (!student) return createApiResponse(404, null, "Student not found");
        await service.deleteStudent(id, tenantId);
        await logAction({
          action: "STUDENT_DELETED",
          userId: user.uid,
          tenantId,
          entityId: id,
          entityType: "student",
          metadata: { name: student.fullName },
        });
    await invalidateCache(`dashboard:${tenantId}`);
        return createApiResponse(200, null, "Student deleted successfully");
      })
    )
  )
);
