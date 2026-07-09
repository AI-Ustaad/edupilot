export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const { uid, role } = await req.json();
        
        if (!uid || !["admin", "teacher", "accountant"].includes(role)) {
          return createErrorResponse(400, "Invalid input");
        }

        await adminAuth.setCustomUserClaims(uid, { role, tenantId });
        await adminDb.collection("users").doc(uid).update({ role, updatedAt: new Date() });

        return createSuccessResponse(null, { message: "Role updated successfully" });
      })
    )
  )
);
