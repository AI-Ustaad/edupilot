export const dynamic = 'force-dynamic';

import {
  withAuth,
  withTenant,
  withErrorHandler,
} from "@/route-helpers";

import { withPermission } from "@/lib/auth/withPermission";  // آپ کی curried فائل
import { PERMISSIONS } from "@/lib/auth/permissions";

import { adminDb } from "@/lib/firebase-admin";
import { createApiResponse } from "@/lib/response/apiResponse";

import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(
        PERMISSIONS.bookCenter.view,
        async (req: Request, { tenantId }: TenantContext) => {
          if (!tenantId) {
            return createApiResponse(401, null, "Tenant not found");
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
          return createApiResponse(200, books);
        }
      )
    )
  )
);
