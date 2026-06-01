import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

// کتابوں کی فہرست حاصل کریں
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const classGrade = searchParams.get("class");
      const subject = searchParams.get("subject");

      let query = adminDb.collection("books").where("tenantId", "==", tenantId);
      if (classGrade) query = query.where("classGrade", "==", classGrade);
      if (subject) query = query.where("subject", "==", subject);
      query = query.orderBy("title");

      const snapshot = await query.get();
      const books = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, books);
    })
  )
);

// نئی کتاب شامل کریں
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { title, classGrade, subject, chapters } = await req.json();
        if (!title || !classGrade || !subject) {
          return createApiResponse(400, null, "Title, class, and subject are required");
        }
        const ref = await adminDb.collection("books").add({
          title: title.trim(),
          classGrade,
          subject,
          chapters: chapters || [],
          tenantId,
          createdBy: user.uid,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: ref.id });
      })
    )
  )
);
