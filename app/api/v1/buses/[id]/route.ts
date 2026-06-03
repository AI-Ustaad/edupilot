import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
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
      withPermission(PERMISSIONS.dashboard.view)(async (req: Request, { tenantId }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const service = new BusService(new BusRepository());
        const bus = await service.getById(id, tenantId);
        if (!bus) {
          return createApiResponse(404, null, "Bus not found");
        }
        return createApiResponse(200, bus);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, { tenantId }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const body = await req.json();
        const service = new BusService(new BusRepository());
        await service.update(id, body, tenantId);
        return createApiResponse(200, null, "Bus updated successfully");
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, { tenantId, user }: WithTenantContext) => {
        const id = getIdFromUrl(req);
        const service = new BusService(new BusRepository());
        const bus = await service.getById(id, tenantId);
        if (!bus) {
          return createApiResponse(404, null, "Bus not found");
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

        return createApiResponse(200, null, "Bus deleted successfully");
      })
    )
  )
);
