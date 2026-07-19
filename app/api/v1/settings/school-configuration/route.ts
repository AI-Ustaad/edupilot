// app/api/v1/settings/school-configuration/route.ts
export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { configurationService } from "@/services/configuration.service"; 
import { createSuccessResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { z } from "zod";

const SchoolConfigurationSchema = z.object({
  schoolName: z.string().trim().min(2, "School name is required"),
  schoolType: z.enum(["Private", "Government", "Madrissa"]),
  curriculumId: z.string().trim().min(1, "Curriculum is required"),
  levels: z.array(z.string().trim().min(1)).min(1, "Select at least one level"),
  sectionNames: z.array(z.string().trim().min(1)).optional(),
});

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      // 1. Get ViewModels from Service
      const configuration = await configurationService.getConfigurationViewModel(tenantId);
      const history = await configurationService.getConfigurationHistoryViewModel(tenantId);
      
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

      // 2. Save via Service
      await configurationService.saveAndPublishConfiguration(input, tenantId, user.uid);

      return createSuccessResponse({ success: true }, { message: "Configuration Published Successfully" });
    }
  )
);
