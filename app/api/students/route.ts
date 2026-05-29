// app/api/students/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { getPlanLimits } from "@/lib/subscription";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      const service = new StudentService(new StudentRepository());
      const result = await service.listStudents(tenantId, page, limit);
      return createApiResponse(200, result);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const limits = await getPlanLimits(tenantId);
        const service = new StudentService(new StudentRepository());
        const currentCount = await service.countStudents(tenantId);

        if (currentCount >= limits.students) {
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
