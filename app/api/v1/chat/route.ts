export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.view)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const parentId = searchParams.get("parentId");

        let query = adminDb.collection("chat_messages").where("tenantId", "==", tenantId);
        if (teacherId) query = query.where("teacherId", "==", teacherId);
        if (parentId) query = query.where("parentId", "==", parentId);
        query = query.orderBy("createdAt", "asc").limit(100);

        const snapshot = await query.get();
        const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        return createSuccessResponse(messages);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.send)(async (req: Request, context: any) => {
        const { tenantId, user } = context;
        const { teacherId, parentId, text } = await req.json();
        
        if (!teacherId || !parentId || !text || !text.trim()) {
          return createErrorResponse(400, "Missing fields");
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
  )
);
