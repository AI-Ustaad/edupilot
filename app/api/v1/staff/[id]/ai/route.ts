export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const idIndex = segments.indexOf("ai") - 1;
  return segments[idIndex] || segments[segments.length - 2];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(
        async (req: Request, { tenantId }) => {
          const id = getIdFromUrl(req);
          const service = new StaffService();
          const summary = await service.getAISummary(tenantId, id);
          return createApiResponse(200, summary, "Staff AI summary");
        }
      )
    )
  )
);
