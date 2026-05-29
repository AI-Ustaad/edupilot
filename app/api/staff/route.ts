// app/api/staff/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/staff.service";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      const service = new StaffService(new StaffRepository());
      const result = await service.listStaff(tenantId, page, limit);
      return createApiResponse(200, result);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new StaffService(new StaffRepository());
        const staff = await service.createStaff(body, tenantId, user.uid);
        return createApiResponse(201, staff, "Staff added successfully");
      })
    )
  )
);
