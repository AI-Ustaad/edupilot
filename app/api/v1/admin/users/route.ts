export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { UserRepository } from "@/repositories/user.repository";

export const runtime = 'nodejs';

const userRepo = new UserRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, context: any) => {
        const { tenantId } = context || {};
        
        const users = await userRepo.findAllByTenant(tenantId);

        return createSuccessResponse(users);
      })
    )
  )
);
