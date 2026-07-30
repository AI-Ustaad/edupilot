export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { TenantBrandingService } from "@/services/tenant-branding.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new TenantBrandingService();
        const branding = await service.getBranding(tenantId);
        return createSuccessResponse(branding || {});
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const { schoolName, logo, primaryColor, customDomain } = body;
        const service = new TenantBrandingService();
        await service.saveBranding(tenantId, { schoolName, logo, primaryColor, customDomain });
        return createApiResponse(200, null, "Branding updated");
      })
    )
  )
);
