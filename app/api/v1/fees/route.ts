import { invalidateCache } from "@/lib/cache";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { standardRateLimit } from "@/lib/ratelimit";
import { withRateLimit } from "@/route-helpers";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId') || undefined;
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const service = new FeesService(new FeesRepository());
        const result = await service.listFees(tenantId, studentId, page, limit);
    await invalidateCache(`dashboard:${tenantId}`);
        return createApiResponse(200, result);
      })
    )
  )
);

export const POST = withRateLimit(standardRateLimit)(
  withErrorHandler(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.fees.create)(async (req: Request, { tenantId }: TenantContext) => {
          const body = await req.json();
          const service = new FeesService(new FeesRepository());
          const fee = await service.createFee(body, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
          return createApiResponse(201, fee, "Fee record created successfully");
        })
      )
    )
  )
);
