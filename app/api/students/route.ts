import { invalidateCache } from "@/lib/cache";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { getPlanLimits } from "@/lib/subscription";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { standardRateLimit } from "@/lib/ratelimit";
import { withRateLimit } from "@/route-helpers";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const service = new StudentService(new StudentRepository());
        const result = await service.listStudents(tenantId, page, limit);
    await invalidateCache(`dashboard:${tenantId}`);
        return createApiResponse(200, result);
      })
    )
  )
);

export const POST = withRateLimit(standardRateLimit)(
  withErrorHandler(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.students.create)(async (req: Request, { tenantId, user }: TenantContext) => {
          const limits = await getPlanLimits(tenantId);
          const service = new StudentService(new StudentRepository());
          const currentCount = await service.countStudents(tenantId);
          if (currentCount >= limits.students) {
    await invalidateCache(`dashboard:${tenantId}`);
            return createApiResponse(403, null, `Student limit reached (${limits.students}). Please upgrade your plan.`);
          }
          const body = await req.json();
          const student = await service.createStudent(body, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
          return createApiResponse(201, student, "Student added successfully");
        })
      )
    )
  )
);
