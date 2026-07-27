export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { AuditService } from "@/services/AuditService";
import type { TenantContext } from "@/types/api";

const auditService = new AuditService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.audit.view)(async (req: Request, { tenantId }: TenantContext) => {
        const logs = await auditService.queryByTenant(tenantId, { limit: 500 });
        return createSuccessResponse(logs);
      })
    )
  )
);
