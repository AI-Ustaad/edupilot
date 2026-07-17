export const dynamic = 'force-dynamic';
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.users.create)(async (req: Request, { tenantId }: TenantContext) => {
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
