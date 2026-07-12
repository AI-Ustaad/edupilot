export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { BusService } from "@/services/bus.service";
import { BusRepository } from "@/repositories/bus.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.buses.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new BusService(new BusRepository());
        const buses = await service.getAll(tenantId);
        return createSuccessResponse(buses);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.buses.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new BusService(new BusRepository());
        const bus = await service.create(body, tenantId, user.uid);
        return createApiResponse(201, bus, "Bus created successfully");
      })
    )
  )
);
