export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { MarksService } from "@/services/marks.service";
import type { TenantContext } from "@/types/api";

const marksService = new MarksService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        await marksService.saveSkills(body, tenantId, user.uid);
        return createApiResponse(200, { success: true });
      })
    )
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        if (!studentId) return createApiResponse(400, null, "Student ID required");

        const term = searchParams.get("term") || undefined;
        const skillsData = await marksService.getSkills(tenantId, studentId, term);
        return createApiResponse(200, skillsData);
      })
    )
  )
);
