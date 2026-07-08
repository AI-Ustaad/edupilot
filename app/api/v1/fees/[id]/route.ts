export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { FeesService } from "@/services/fees.service";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';
import type { TenantContext } from "@/types/api";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.view)(async (req: Request, { tenantId }: TenantContext) => {
        const id = getIdFromUrl(req);
        const service = new FeesService();
        const fee = await service.getFeeById(id, tenantId);
        if (!fee) return createErrorResponse(404, "Fee record not found");
        return createSuccessResponse(fee);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);
        const body = await req.json();
        const service = new FeesService();
        await service.updateFee(id, body, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Fee record updated successfully" });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);
        const service = new FeesService();
        const fee = await service.getFeeById(id, tenantId);
        if (!fee) return createErrorResponse(404, "Fee record not found");
        await service.deleteFee(id, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Fee record deleted successfully" });
      })
    )
  )
);

