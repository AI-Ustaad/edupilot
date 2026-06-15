export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const { uid, role } = await req.json();
        
        if (!uid || !["admin", "teacher", "accountant"].includes(role)) {
          return NextResponse.json(createApiResponse(400, null, "Invalid input"), { status: 400 });
        }

        await adminAuth.setCustomUserClaims(uid, { role, tenantId });
        await adminDb.collection("users").doc(uid).update({ role, updatedAt: new Date() });

        return NextResponse.json(createApiResponse(200, null, "Role updated successfully"));
      })
    )
  )
);
