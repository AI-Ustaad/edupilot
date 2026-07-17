export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { schoolConfigurationService } from "@/services/school-configuration.service"; 
import { createSuccessResponse } from "@/lib/api/response";
import { SchoolConfigurationSchema } from "@/types/school-configuration";
import type { TenantContext } from "@/types/api";

// 🟢 GET: Fetch Active Configuration (Reads Single Source of Truth)
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const configuration = await schoolConfigurationService.getConfiguration(tenantId);
      const history = await schoolConfigurationService.getHistory(tenantId);
      
      return createSuccessResponse({ configuration, history });
    })
  )
);

// 🟢 POST / PUT: Save Configuration (Domain Logic is handled by Service)
export const POST = withErrorHandler(
  withAuth(
    async (req: Request, context: any) => {
      const user = context.user;
      const tenantId = user.tenantId || `tenant_${user.uid}`;
      
      const body = await req.json();
      
      // 🚀 Zod Validation: Ensuring strict DTO compliance before hitting the service
      const input = SchoolConfigurationSchema.parse(body);

      const configuration = await schoolConfigurationService.saveConfiguration(
        input, 
        tenantId, 
        user.uid
      );

      return createSuccessResponse(configuration, { 
        message: "School Configuration Saved Successfully" 
      });
    }
  )
);

// 🟢 Map PUT to POST as requested
export const PUT = POST;
