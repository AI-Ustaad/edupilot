export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { standardRateLimit } from "@/lib/ratelimit";
import { SubscriptionService } from "@/services/subscription.service";
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
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "20");
          const search = url.searchParams.get("search") || undefined;

          const service = new StaffService();

          // If search query is provided, use search instead of pagination
          if (search) {
            const results = await service.search(tenantId, search);
            return createApiResponse(200, results, "Staff search results");
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
            const service = new StaffService();

            // Check subscription limits (resilient — never block staff creation due to subscription service errors)
            try {
              const limits = await subscriptionService.getPlanLimits(tenantId);
              await service.checkSubscriptionLimit(tenantId, limits.maxStaff);
            } catch (err: any) {
              // If it's a SubscriptionLimitException, re-throw (legitimate limit reached)
              if (err.code === "SUBSCRIPTION_LIMIT") {
                throw err;
              }
              // For any other error (Firestore down, tenant not found, etc.), log and continue
              logger.error("[Staff POST] Subscription check failed, bypassing:", {
                metadata: { error: err.message, tenantId },
              });
            }

            const id = await service.create(body, tenantId, user.uid);
            return createApiResponse(201, { id }, "Staff added successfully");
          }
        )
      )
    )
  )
);
