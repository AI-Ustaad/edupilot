export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { AuditRepository } from "@/repositories/audit.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.audit.view)(async (req: Request, { tenantId }: TenantContext) => {
        const auditRepo = new AuditRepository();
        const logs = await auditRepo.findRecent(tenantId, 500);
        return createSuccessResponse(logs);
      })
    )
  )
);
