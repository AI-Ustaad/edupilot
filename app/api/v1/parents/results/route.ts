export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { ParentsService } from "@/services/parents.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.parents.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const parentService = new ParentsService();
        const children = await parentService.getChildren(user.uid, tenantId);
        return createSuccessResponse(children.map(child => ({
          student: child,
          results: []
        })));
      })
    )
  )
);

