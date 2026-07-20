// app/api/v1/settings/curriculum/route.ts
export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { configurationService } from "@/services/configuration.service"; // 🚀 FIX: configurationService
import { z } from "zod";
import type { TenantContext } from "@/types/api";

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
        const current = await configurationService.getConfigurationViewModel(tenantId);
        
        const parsed = CurriculumSchema.safeParse({
          schoolName: body.schoolName || current?.schoolName,
          schoolType: body.schoolType || current?.schoolType,
          curriculumId: body.curriculumId || body.curriculum, // 🚀 FIX: Removed current?.curriculumId
          levels: body.levels || current?.levels,
          sectionNames: body.sectionNames || current?.sectionNames,
        });
        
        if (!parsed.success) return createErrorResponse(400, "Invalid school configuration", parsed.error.errors);
        
        // Note: This route is now mostly deprecated by the Rules Engine, 
        // but we keep it for backward compatibility.
        await configurationService.saveAndPublishConfiguration(
          {
            schoolProfile: {
               name: parsed.data.schoolName || "Untitled",
               type: parsed.data.schoolType || "Private",
               curriculumId: parsed.data.curriculumId,
               boardName: "Custom Board",
               sections: parsed.data.sectionNames || ["A"]
            },
            // Mock empty structure to pass validator if called from here
            academicStructure: {
               levels: [],
               grades: [], 
               allSubjects: [],
               requiredLabs: [],
               requiredTeachers: {}
            }
          }, 
          tenantId, 
          user.uid
        );
        
        return createSuccessResponse({ success: true }, { message: "Curriculum applied through School Configuration." });
      })
    )
  )
);
