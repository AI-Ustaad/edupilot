export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { ConfigurationService } from "@/services/configuration.service";
import { createSuccessResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

const configService = new ConfigurationService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      // 🟢 Note: Repository is imported inside Service, we just call the method
      // For GET, we'd add a getActiveConfiguration method in the service that returns the repo data
      return createSuccessResponse({ message: "Config endpoint ready" });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    // Note: If user is setting up, they might not have a tenant in context yet, 
    // so ensure your middleware allows them to pass or creates a tenant ID.
    async (req: Request, context: any) => {
      const user = context.user;
      const tenantId = user.tenantId || `tenant_${user.uid}`;
      const body = await req.json();
      
      const { action, payload, reason } = body;

      if (action === "publish") {
        await configService.publishConfiguration(tenantId, user.uid);
        return createSuccessResponse(null, { message: "Configuration Published Successfully" });
      }

      // Default: Save as Draft (Version++)
      const newConfig = await configService.saveDraft(tenantId, user.uid, payload, reason || "Configuration Update");
      
      return createSuccessResponse(newConfig, { message: "Configuration Draft Saved" });
    }
  )
);
