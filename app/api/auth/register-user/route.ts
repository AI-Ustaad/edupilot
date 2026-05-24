import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(async (req: Request, { user }: TenantContext) => {
    const { name } = await req.json();

    if (!name) {
      return createApiResponse(400, null, "Name is required");
    }

    const userRef = adminDb.collection("users").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        email: user.email,
        name: name,
        role: user.role || "teacher",
        tenantId: user.tenantId,
        createdAt: new Date().toISOString(),
      });
    }

    return createApiResponse(200, { success: true, uid: user.uid });
  })
);
