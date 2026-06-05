export const dynamic = 'force-dynamic';
// app/api/ledger/route.ts
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";

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
        return createApiResponse(200, data);
      } catch (err: any) {
        console.error("Error fetching ledger:", err);
        return createApiResponse(500, null, "Failed to fetch ledger");
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
          return createApiResponse(400, null, "Missing required fields");
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
        console.error("Error adding ledger entry:", err);
        return createApiResponse(500, null, "Failed to add ledger entry");
      }
    })
  )
);
