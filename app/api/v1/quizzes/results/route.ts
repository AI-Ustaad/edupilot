export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const quizId = searchParams.get("quizId");
      if (!quizId) {
        return createErrorResponse(400, "quizId is required");
      }

      const snapshot = await adminDb
        .collection("quiz_submissions")
        .where("quizId", "==", quizId)
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .get();

      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createSuccessResponse(data);
    })
  )
);
