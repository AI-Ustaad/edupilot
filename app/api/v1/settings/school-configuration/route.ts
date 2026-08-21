// app/api/v1/settings/school-configuration/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { configurationService } from "@/services/configuration.service";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { z } from "zod";

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
    withTenant(async (_req: Request, context: TenantContext) => {
      const { tenantId } = context;

      const loadResult = await configurationService.loadConfiguration(tenantId);

      if (loadResult.status === "NOT_CONFIGURED") {
        return NextResponse.json({
          success: true,
          data: {
            configuration: null,
            history: [],
            status: loadResult.status,
            nextAction: loadResult.nextAction,
          },
        });
      }

      const configuration = await configurationService.getConfigurationViewModel(tenantId);
      const history = await configurationService.getConfigurationHistoryViewModel(tenantId);
      
      return createSuccessResponse({ configuration, history, status: loadResult.status });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, context: TenantContext) => {
      const { tenantId, user } = context;

      if (!user) {
        return createErrorResponse(401, "Unauthorized");
      }

      const body = await req.json();
      
      const parsed = SmartConfigSchema.safeParse(body);
      if (!parsed.success) {
        return createErrorResponse(400, "Invalid configuration payload", parsed.error.errors);
      }

      try {
        const result = await configurationService.saveAndPublishConfiguration(parsed.data, tenantId, user.uid);

        return createSuccessResponse({
          success: true,
          configuration: result,
          status: "CONFIGURED",
        }, { message: "Configuration Published Successfully" });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : "Failed to save configuration",
        }, { status: 400 });
      }
    })
  )
);
