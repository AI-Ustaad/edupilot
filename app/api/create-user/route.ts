import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const { email, password, role } = body;

        const newUser = await adminAuth.createUser({ email, password });
        await adminAuth.setCustomUserClaims(newUser.uid, { role, tenantId });
        await adminDb.collection("users").doc(newUser.uid).set({
          email, role, tenantId,
          createdAt: new Date(),
        });

        return createApiResponse(201, { uid: newUser.uid });
      })
    )
  )
);
