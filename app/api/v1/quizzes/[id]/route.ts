export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const id = new URL(req.url).pathname.split("/").pop() || "";
      const doc = await adminDb.collection("quizzes").doc(id).get();
      if (!doc.exists) {
        return createErrorResponse(404, "Quiz not found");
      }
      return createSuccessResponse({ id: doc.id, ...doc.data() });
    })
  )
);
