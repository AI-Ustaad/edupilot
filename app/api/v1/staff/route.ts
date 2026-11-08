export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { standardRateLimit } from "@/lib/ratelimit";
import { SubscriptionService } from "@/services/subscription.service";
import { checkStaffQuota } from "@/lib/quota-guard";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logger } from "@/lib/logger/logger";

const subscriptionService = new SubscriptionService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(
        async (req: Request, { tenantId }: TenantContext) => {
          const url = new URL(req.url);
          const page = parseInt(url.searchParams.get("page") || "1", 10);
          const limit = parseInt(url.searchParams.get("limit") || "20", 10);
          const search = url.searchParams.get("search") || undefined;
          const category = url.searchParams.get("category") || undefined;
          const department = url.searchParams.get("department") || undefined;
          const designation = url.searchParams.get("designation") || undefined;
          const status = url.searchParams.get("status") || undefined;
          const campus = url.searchParams.get("campus") || undefined;
          const gender = url.searchParams.get("gender") || undefined;
          const employmentType = url.searchParams.get("employmentType") || undefined;
          const orderBy = url.searchParams.get("orderBy") || undefined;
          const direction = url.searchParams.get("direction") as "asc" | "desc" | undefined;

          const service = new StaffService();

          const hasFilters = search || category || department || designation || status || campus || gender || employmentType;

          if (hasFilters) {
            const result = await service.advancedFilter(tenantId, {
              search, category, department, designation, status, campus, gender, employmentType,
              page, limit, orderBy, direction,
            });
            return createApiResponse(200, result, "Staff filtered results", {
              page, limit, total: result.total, totalPages: result.totalPages,
            });
          }

          const result = await service.paginate(tenantId, page, limit);
          return createApiResponse(200, result, "Staff list fetched", {
            page,
            limit,
            total: result.total,
            totalPages: result.totalPages,
          });
        }
      )
    )
  )
);

export const POST = withRateLimit(standardRateLimit)(
  withErrorHandler(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.staff.create)(
          async (req: Request, { tenantId, user }: TenantContext) => {
            const body = await req.json();
            await checkStaffQuota(tenantId, 1);
            const service = new StaffService();

            const id = await service.create(body, tenantId, user.uid);
            return createApiResponse(201, { id }, "Staff added successfully");
          }
        )
      )
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(
        async (req: Request, { tenantId, user }: TenantContext) => {
          const body = await req.json();
          const { searchParams } = new URL(req.url);
          const id = body?.id || searchParams.get("id");
          if (!id) return createApiResponse(400, null, "Staff ID is required");

          const service = new StaffService();
          await service.update(tenantId, id, body, user.uid);
          return createSuccessResponse(null, { message: "Staff updated successfully" });
        }
      )
    )
  )
);

export const PATCH = PUT;

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.delete)(
        async (req: Request, { tenantId, user }: TenantContext) => {
          const { searchParams } = new URL(req.url);
          const id = searchParams.get("id");
          if (!id) return createApiResponse(400, null, "Staff ID is required");

          const service = new StaffService();
          await service.delete(tenantId, id, user.uid);
          return createSuccessResponse(null, { message: "Staff deleted successfully" });
        }
      )
    )
  )
);
