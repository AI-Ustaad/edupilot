export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { BusService } from "@/services/bus.service";
import { BusRepository } from "@/repositories/bus.repository";
import { logAction } from "@/lib/audit";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.buses.view)(async (req: Request, { tenantId }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const service = new BusService(new BusRepository());
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
     withPermission(PERMISSIONS.buses.update)(async (req: Request, { tenantId }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const body = await req.json();
        const service = new BusService(new BusRepository());
        await service.update(id, body, tenantId);
        return createSuccessResponse(null, { message: "Bus updated successfully" });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId, user }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const service = new BusService(new BusRepository());
        const bus = await service.getById(id, tenantId);
        if (!bus) {
          return createErrorResponse(404, "Bus not found");
        }

        await service.delete(id, tenantId);

        // آڈٹ لاگ
        await logAction({
          action: "BUS_DELETED",
          userId: user.uid,
          tenantId,
          entityId: id,
          entityType: "bus",
          metadata: { busNumber: bus.busNumber },
        });

        return createSuccessResponse(null, { message: "Bus deleted successfully" });
      })
    )
  )
);
