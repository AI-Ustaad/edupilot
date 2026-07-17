export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const runtime = 'nodejs';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, context: any) => {
        const { tenantId } = context || {};
        
        const usersSnapshot = await adminDb
          .collection("users")
          .where("tenantId", "==", tenantId)
          .get();

        const users = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            email: data.email,
            role: data.role || "teacher",
            name: data.name || data.email?.split("@")[0],
          };
        });

        return createSuccessResponse(users);
      })
    )
  )
);
