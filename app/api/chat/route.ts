import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const teacherId = searchParams.get("teacherId");
      const parentId = searchParams.get("parentId");

      let query = adminDb.collection("chat_messages").where("tenantId", "==", tenantId);
      if (teacherId) query = query.where("teacherId", "==", teacherId);
      if (parentId) query = query.where("parentId", "==", parentId);
      query = query.orderBy("createdAt", "asc").limit(100);

      const snapshot = await query.get();
      const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, messages);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { teacherId, parentId, text } = await req.json();
      if (!teacherId || !parentId || !text || !text.trim()) {
        return createApiResponse(400, null, "Missing fields");
      }
      const ref = await adminDb.collection("chat_messages").add({
        teacherId,
        parentId,
        text: text.trim(),
        senderRole: user.role,
        senderUid: user.uid,
        tenantId,
        createdAt: new Date(),
      });
      return createApiResponse(201, { id: ref.id });
    })
  )
);
