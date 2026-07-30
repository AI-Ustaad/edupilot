export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { BusService } from "@/services/bus.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.buses.view)(async (req: Request, { tenantId }: TenantContext) => {
        const id = getIdFromUrl(req);
        const service = new BusService();
        const bus = await service.getById(id, tenantId);
        if (!bus) {
          return createErrorResponse(404, "Bus not found");
        }
        return createSuccessResponse(bus);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.buses.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);
        const body = await req.json();
        const service = new BusService();
        await service.update(id, body, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Bus updated successfully" });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.buses.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);
        const service = new BusService();
        const bus = await service.getById(id, tenantId);
        if (!bus) {
          return createErrorResponse(404, "Bus not found");
        }

        await service.delete(id, tenantId, user.uid);

        return createSuccessResponse(null, { message: "Bus deleted successfully" });
      })
    )
  )
);
