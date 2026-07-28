export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { UserAdminService } from "@/services/user-admin.service";

export const runtime = 'nodejs';

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, context: any) => {
      const { tenantId } = context || {};
      
      const service = new UserAdminService();
      const users = await service.findAllByTenant(tenantId);

      return createSuccessResponse(users);
    })
  )
);
