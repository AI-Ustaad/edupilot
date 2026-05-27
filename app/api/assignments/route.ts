import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const classGrade = searchParams.get("classGrade");
      const section = searchParams.get("section");

      let query = adminDb.collection("assignments").where("tenantId", "==", tenantId);
      if (classGrade) query = query.where("classGrade", "==", classGrade);
      if (section) query = query.where("section", "==", section);
      query = query.orderBy("createdAt", "desc").limit(50);

      const snapshot = await query.get();
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, data);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { title, description, classGrade, section, dueDate } = await req.json();
        if (!title || !classGrade || !section || !dueDate) {
          return createApiResponse(400, null, "Missing required fields");
        }
        const ref = await adminDb.collection("assignments").add({
          title,
          description: description || "",
          classGrade,
          section,
          dueDate,
          createdBy: user.uid,
          tenantId,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: ref.id });
      })
    )
  )
);
