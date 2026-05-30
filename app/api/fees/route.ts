// app/api/fees/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const url = new URL(req.url);
      const studentId = url.searchParams.get('studentId') || undefined;
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      const service = new FeesService(new FeesRepository());
      const result = await service.listFees(tenantId, studentId, page, limit);
      return createApiResponse(200, result);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "accountant"])(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const service = new FeesService(new FeesRepository());
        const fee = await service.createFee(body, tenantId);
        return createApiResponse(201, fee, "Fee record created successfully");
      })
    )
  )
);
