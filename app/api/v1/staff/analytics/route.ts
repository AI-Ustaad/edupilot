export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(
        async (req: Request, { tenantId }) => {
          const service = new StaffService();
          const analytics = await service.getAnalytics(tenantId);
          return createApiResponse(200, analytics, "Staff analytics");
        }
      )
    )
  )
);
