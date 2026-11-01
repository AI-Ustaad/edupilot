export const dynamic = 'force-dynamic';
import { withAuth, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { TenantRepository } from "@/repositories/tenant.repository";

export const GET = withErrorHandler(
  withAuth(async (_req: Request, context: any) => {
    const user = context?.user;
    if (!user || (user.role !== "superAdmin" && user.role !== "super_admin")) {
      return createErrorResponse(403, "Forbidden: Super Admin access required");
    }

    const tenantRepo = new TenantRepository();
    const tenants = await tenantRepo.listAll();
    return createSuccessResponse(tenants);
  })
);

