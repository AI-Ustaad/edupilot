// app/api/v1/settings/school-configuration/route.ts
export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { configurationService } from "@/services/configuration.service"; 
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { z } from "zod";

// 🚀 NEW: Zod Schema for the new Smart Wizard Payload
const SmartConfigSchema = z.object({
  schoolProfile: z.object({
    name: z.string().min(2, "School name is required"),
    type: z.string(),
    curriculumId: z.string(),
    boardName: z.string().optional(),
    country: z.string().optional(),
    sections: z.array(z.string()).optional(),
  }),
  academicStructure: z.object({
    levels: z.array(z.any()),
    grades: z.array(z.any()),
    allSubjects: z.array(z.any()),
    requiredLabs: z.array(z.any()).optional(),
    requiredTeachers: z.record(z.any()).optional(),
    departments: z.array(z.any()).optional(),
  })
});

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
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
      
      // Validate with new schema
      const parsed = SmartConfigSchema.safeParse(body);
      if (!parsed.success) {
        return createErrorResponse(400, "Invalid configuration payload", parsed.error.errors);
      }

      // Save via Service
      await configurationService.saveAndPublishConfiguration(parsed.data, tenantId, user.uid);

      return createSuccessResponse({ success: true }, { message: "Configuration Published Successfully" });
    }
  )
);
