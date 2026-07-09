export const dynamic = 'force-dynamic';

import {
  withAuth,
  withTenant,
  withErrorHandler,
} from "@/route-helpers";

import { withPermission } from "@/lib/auth/withPermission";  // آپ کی curried فائل
import { PERMISSIONS } from "@/lib/auth/permissions";

import { adminDb } from "@/lib/firebase-admin";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(
        PERMISSIONS.bookCenter.view,
        async (req: Request, { tenantId }: TenantContext) => {
          if (!tenantId) {
            return createErrorResponse(401, "Tenant not found");
          }

          const url = new URL(req.url);
          const classGrade = url.searchParams.get("classGrade") || undefined;
          const subject = url.searchParams.get("subject") || undefined;

          let query: FirebaseFirestore.Query = adminDb.collection("books");
          query = query.where("tenantId", "==", tenantId);
          if (classGrade) query = query.where("classGrade", "==", classGrade);
          if (subject) query = query.where("subject", "==", subject);
          query = query.orderBy("title");

          const snapshot = await query.get();
          const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return createSuccessResponse(books);
        }
      )
    )
  )
);
