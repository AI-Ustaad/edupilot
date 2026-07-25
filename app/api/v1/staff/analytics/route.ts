export const dynamic = "force-dynamic";

import { withAuthAndPermission } from "@/route-helpers";
import { createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withAuthAndPermission(PERMISSIONS.staff.view, async (req, context) => {
  const tenantId = context.user.tenantId;
  const service = new StaffService();
  const analytics = await service.getAnalytics(tenantId);
  return createApiResponse(200, analytics, "Staff analytics");
});
