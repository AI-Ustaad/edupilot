export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("id");

        if (!studentId) {
          return createErrorResponse(400, "Student ID required");
        }

        const service = new StudentService();
        const student = await service.getById(tenantId, studentId);
        return createSuccessResponse(student);
      })
    )
  )
);
