export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { TenantBrandingService } from "@/services/tenant-branding.service";
import { TenantRepository } from "@/repositories/tenant.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new TenantBrandingService();
        let branding = await service.getBranding(tenantId);
        
        // If no custom branding or no schoolName, resolve from tenant repository
        if (!branding || !branding.schoolName) {
          const tenantRepo = new TenantRepository();
          const tenant = await tenantRepo.findById(tenantId, tenantId).catch(() => null);
          const defaultName = tenant?.name || "Government High School Sahiwal";
          branding = {
            ...(branding || {}),
            schoolName: branding?.schoolName || defaultName,
            primaryColor: branding?.primaryColor || "#3b82f6",
            secondaryColor: branding?.secondaryColor || "#10b981",
          } as any;
        }

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
        const {
          schoolName,
          logo,
          favicon,
          coverImage,
          primaryColor,
          secondaryColor,
          customDomain,
          customCSS,
        } = body;
        const service = new TenantBrandingService();
        await service.saveBranding(tenantId, {
          schoolName,
          logo,
          favicon,
          coverImage,
          primaryColor,
          secondaryColor,
          customDomain,
          customCSS,
        });
        return createApiResponse(200, null, "Branding updated");
      })
    )
  )
);
