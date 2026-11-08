// app/api/v1/students/[id]/route.ts
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const dynamic = 'force-dynamic';

function getId(req: Request): string {
  const url = new URL(req.url);
  return url.pathname.split("/").pop() || "";
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const id = getId(req);
        if (!id) return createErrorResponse(400, "Student ID is required");

        const service = new StudentService();
        try {
          const data360 = await service.student360(tenantId, id);
          if (data360 && data360.student) {
            return createSuccessResponse({
              ...data360.student,
              student: data360.student,
              attendance: data360.attendance?.records || [],
              fees: data360.fees?.records || [],
              marks: data360.marks?.exams || [],
              timeline: data360.timeline || [],
              analytics: (data360 as any).analytics,
            });
          }
        } catch {
          // fallback to getById
        }

        const student = await service.getById(tenantId, id);
        return createSuccessResponse(student);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getId(req);
        if (!id) return createErrorResponse(400, "Student ID is required");

        const body = await req.json();
        const service = new StudentService();
        const updated = await service.update(tenantId, id, body, user.uid);
        return createSuccessResponse(updated, { message: "Student updated" });
      })
    )
  )
);

export const PATCH = PUT;

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getId(req);
        if (!id) return createErrorResponse(400, "Student ID is required");

        const service = new StudentService();
        await service.delete(tenantId, id, user.uid);
        return createSuccessResponse(null, { message: "Student deleted" });
      })
    )
  )
);

