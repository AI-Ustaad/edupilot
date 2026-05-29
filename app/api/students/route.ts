import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { getPlanLimits } from "@/lib/subscription";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const service = new StudentService(new StudentRepository());
      const students = await service.listStudents(tenantId);
      return createApiResponse(200, students);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        // پلان کی حد چیک کریں
        const limits = await getPlanLimits(tenantId);
        const service = new StudentService(new StudentRepository());
        const existing = await service.listStudents(tenantId);
        if (existing.length >= limits.students) {
          return createApiResponse(
            403,
            null,
            `Student limit reached (${limits.students}). Please upgrade your plan.`
          );
        }

        const body = await req.json();
        const student = await service.createStudent(body, tenantId);
        return createApiResponse(201, student, "Student added successfully");
      })
    )
  )
);
