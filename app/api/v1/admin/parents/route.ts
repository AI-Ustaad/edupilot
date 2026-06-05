export const dynamic = 'force-dynamic';
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { email, password, fullName, phone, studentIds } = await req.json();
        if (!email || !password || !studentIds?.length) {
          return createApiResponse(400, null, "Missing fields");
        }

        const newUser = await adminAuth.createUser({ email, password });
        await adminAuth.setCustomUserClaims(newUser.uid, { role: "parent", tenantId });

        await adminDb.collection("parents").doc(newUser.uid).set({
          fullName, email,
          phone: phone || "",
          studentIds,
          tenantId,
          createdAt: new Date(),
        });

        return createApiResponse(201, { uid: newUser.uid });
      })
    )
  )
);
