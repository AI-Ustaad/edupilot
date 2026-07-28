export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SyllabusService } from "@/services/syllabus.service";
import type { TenantContext } from "@/types/api";

const syllabusService = new SyllabusService();

function getId(req: Request): string {
  return new URL(req.url).pathname.split("/").pop() || "";
}

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.syllabus.delete)(async (req: Request, { tenantId }: TenantContext) => {
        await syllabusService.softDelete(getId(req), tenantId);
        return createSuccessResponse(null, { message: "Deleted" });
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.syllabus.update)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        await syllabusService.updateSyllabus(getId(req), tenantId, body);
        return createSuccessResponse(null, { message: "Updated" });
      })
    )
  )
);
