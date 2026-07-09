export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const GET = withAuth(
  withTenant(
    withErrorHandler(async (req: Request, context: any) => {
      const { params, tenantId } = context || {};
      const { id } = params || {};

      if (!id) {
        return NextResponse.json(
          createApiResponse(400, "Academic year ID is missing"), 
          { status: 400 }
        );
      }

      const docRef = adminDb.collection(`tenants/${tenantId}/academicYears`).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return NextResponse.json(
          createApiResponse(404, "Academic year not found"), 
          { status: 404 }
        );
      }

      return createSuccessResponse({ id: doc.id, ...doc.data() }, { message: "Academic year retrieved" });
    })
  )
);
