eexport const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler } from "@/route-helpers";

export async function GET(req: NextRequest) {
  // آپ کا کوڈ یہاں رہے گا...
}
  withErrorHandler, 
  withAuth, 
  withTenant, 
  withRole 
} from "@/route-helpers";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole([PERMISSIONS.settings.view])(async (req: NextRequest, context: any) => {
        const { tenantId } = context || {};

        const snapshot = await adminDb
          .collection("tenants")
          .doc(tenantId)
          .collection("features")
          .get();

        const features = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return NextResponse.json({ success: true, data: features });
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withRole([PERMISSIONS.settings.update])(async (req: NextRequest, context: any) => {
        const { tenantId, user } = context || {};
        const body = await req.json();
        const { feature, enabled } = body;

        if (!feature) {
          return NextResponse.json(
            { error: "Feature name is required" },
            { status: 400 }
          );
        }

        await adminDb
          .collection("tenants")
          .doc(tenantId)
          .collection("features")
          .doc(feature)
          .set(
            { 
              enabled, 
              updatedBy: user?.id || "system", 
              updatedAt: new Date().toISOString() 
            }, 
            { merge: true }
          );

        return NextResponse.json({ 
          success: true, 
          message: "Feature flag updated successfully" 
        });
      })
    )
  )
);
