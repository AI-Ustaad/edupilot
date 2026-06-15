export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant, withPermission } from "@/route-helpers";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";

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

        return NextResponse.json(createApiResponse(200, users));
      })
    )
  )
);
