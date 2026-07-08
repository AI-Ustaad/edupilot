export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse, createErrorResponse } from "@/lib/api/response";
import { TimetableService } from "@/services/timetable.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

const timetableService = new TimetableService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const entries = await timetableService.listEntries(tenantId);
      return createSuccessResponse({ entries });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.timetable.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const id = await timetableService.createEntry(body, tenantId, user.uid);
        return createApiResponse(201, { id });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.timetable.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return createErrorResponse(400, "Entry ID is required");
        await timetableService.deleteEntry(id, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Timetable entry deleted" });
      })
    )
  )
);
