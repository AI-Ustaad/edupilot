export const dynamic = 'force-dynamic';
// app/api/ledger/route.ts
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger/logger";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      try {
        const snapshot = await adminDb
          .collection("ledger")
          .where("tenantId", "==", tenantId)
          .orderBy("createdAt", "desc")
          .get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return createSuccessResponse(data);
      } catch (err: any) {
        logger.error("Error fetching ledger:", { metadata: { error: err.message } });
        return createErrorResponse(500, "Failed to fetch ledger");
      }
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      try {
        const body = await req.json();
        if (!body.type || !body.description || !body.amount) {
          return createErrorResponse(400, "Missing required fields");
        }

        const docRef = await adminDb.collection("ledger").add({
          ...body,
          amount: Number(body.amount),
          tenantId,
          createdBy: user.uid,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: docRef.id }, "Ledger entry added");
      } catch (err: any) {
        logger.error("Error adding ledger entry:", { metadata: { error: err.message } });
        return createErrorResponse(500, "Failed to add ledger entry");
      }
    })
  )
);
