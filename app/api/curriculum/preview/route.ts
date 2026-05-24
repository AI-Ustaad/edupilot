import { curriculumMap } from "@/lib/curriculum-data";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, {}: TenantContext) => {
        const { schoolType, level } = await req.json();
        const curriculum = curriculumMap[schoolType as keyof typeof curriculumMap]?.[level];
        if (!curriculum) return createApiResponse(400, null, "Invalid school type or level");
        return createApiResponse(200, {
          classes: curriculum.classes,
          subjects: curriculum.subjects,
        });
      })
    )
  )
);
