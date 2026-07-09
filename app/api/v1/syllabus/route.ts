export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const classGrade = searchParams.get("class");
      const subject = searchParams.get("subject");

      let query = adminDb.collection("syllabus").where("tenantId", "==", tenantId);
      if (classGrade) query = query.where("classGrade", "==", classGrade);
      if (subject) query = query.where("subject", "==", subject);

      const snapshot = await query.orderBy("createdAt", "desc").get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return createSuccessResponse(data);
    })
  )
);
