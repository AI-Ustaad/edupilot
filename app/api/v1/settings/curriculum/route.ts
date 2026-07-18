// app/api/v1/settings/curriculum/route.ts
export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { configurationAppService } from "@/services/configuration.application.service";
import { z } from "zod";
import type { TenantContext } from "@/types/api";

// Inline Zod Schema to prevent import errors
const CurriculumSchema = z.object({
  schoolName: z.string().optional(),
  schoolType: z.enum(["Private", "Government", "Madrissa"]).optional(),
  curriculumId: z.string().min(1, "Curriculum is required"),
  levels: z.array(z.string().min(1)).min(1, "Select at least one level").optional(),
  sectionNames: z.array(z.string()).optional(),
});

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const current = await configurationAppService.getConfiguration(tenantId);
        
        const parsed = CurriculumSchema.safeParse({
          schoolName: body.schoolName || current?.school.name,
          schoolType: body.schoolType || current?.school.type,
          curriculumId: body.curriculumId || body.curriculum || current?.school.curriculumId,
          levels: body.levels || current?.academic.levels,
          sectionNames: body.sectionNames || current?.academic.sectionNames,
        });
        
        if (!parsed.success) return createErrorResponse(400, "Invalid school configuration", parsed.error.errors);
        
        const configuration = await configurationAppService.saveAndPublishConfiguration(
          parsed.data as any, 
          tenantId, 
          user.uid
        );
        
        return createSuccessResponse(configuration, { message: "Curriculum applied through School Configuration." });
      })
    )
  )
);
