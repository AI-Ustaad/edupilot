// app/api/v1/settings/school-configuration/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { configurationAppService } from "@/services/configuration.application.service"; 
import { createSuccessResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { z } from "zod";

const SchoolConfigurationSchema = z.object({
  schoolName: z.string().trim().min(2, "School name is required"),
  schoolType: z.enum(["Private", "Government", "Madrissa"]),
  curriculumId: z.string().trim().min(1, "Curriculum is required"),
  levels: z.array(z.string().trim().min(1)).min(1, "Select at least one level"),
  sectionNames: z.array(z.string().trim().min(1)).optional(),
  country: z.string().optional(),
});

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const configuration = await configurationAppService.getConfiguration(tenantId);
      const history = await configurationAppService.getHistory(tenantId);
      
      return createSuccessResponse({ configuration, history });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    async (req: Request, context: any) => {
      const user = context.user;
      const tenantId = user.tenantId || `tenant_${user.uid}`;
      
      const body = await req.json();
      const input = SchoolConfigurationSchema.parse(body);

      const configuration = await configurationAppService.saveAndPublishConfiguration(
        input, 
        tenantId, 
        user.uid
      );

      return createSuccessResponse(configuration, { 
        message: "School Configuration Published Successfully" 
      });
    }
  )
);

export const PUT = POST;
