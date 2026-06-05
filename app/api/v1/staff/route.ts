export const dynamic = 'force-dynamic';
import { invalidateCache } from "@/lib/cache";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/staff.service";
import { StaffRepository } from "@/repositories/staff.repository";
import { SubscriptionService } from "@/services/subscription.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { standardRateLimit } from "@/lib/ratelimit";
import { withRateLimit } from "@/route-helpers";

const subscriptionService = new SubscriptionService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const service = new StaffService(new StaffRepository());
        const result = await service.listStaff(tenantId, page, limit);
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
        withPermission(PERMISSIONS.staff.create)(async (req: Request, { tenantId, user }: TenantContext) => {
          const limits = await subscriptionService.getPlanLimits(tenantId);
          const service = new StaffService(new StaffRepository());
          const currentCount = await service.countStaff(tenantId);
          if (currentCount >= limits.maxStaff) {
    await invalidateCache(`dashboard:${tenantId}`);
            return createApiResponse(403, null, `Staff limit reached (${limits.maxStaff}). Please upgrade your plan.`);
          }
          const body = await req.json();
          const staff = await service.createStaff(body, tenantId, user.uid);
    await invalidateCache(`dashboard:${tenantId}`);
          return createApiResponse(201, staff, "Staff added successfully");
        })
      )
    )
  )
);
