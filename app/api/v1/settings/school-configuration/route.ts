export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { schoolConfigurationService } from "@/services/school-configuration.service"; 
import { createSuccessResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { z } from "zod";

// 🟢 FIX: Inline Zod Schema to prevent export/import errors
const SchoolConfigurationSchema = z.object({
  schoolName: z.string().trim().min(2, "School name is required"),
  schoolType: z.enum(["Private", "Government", "Madrissa"]),
  curriculumId: z.string().trim().min(1, "Curriculum is required"),
  levels: z.array(z.string().trim().min(1)).min(1, "Select at least one level"),
  sectionNames: z.array(z.string().trim().min(1)).optional(),
});

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
      
      // 🚀 Zod Validation
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

export const PUT = POST;
