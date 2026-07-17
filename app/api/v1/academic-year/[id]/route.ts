export const dynamic = 'force-dynamic';

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";

export const GET = withAuth(
  withTenant(
    withErrorHandler(async (req: Request, context: any) => {
      const { params, tenantId } = context || {};
      const { id } = params || {};

      if (!id) {
        return createErrorResponse(400, "Academic year ID is missing");
      }

      const repo = new AcademicYearRepository();
      const doc = await repo.findById(id, tenantId);

      if (!doc) {
        return createErrorResponse(404, "Academic year not found");
      }

      return createSuccessResponse({ ...doc, id: doc.id }, { message: "Academic year retrieved" });
    })
  )
);
