export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { ChatService } from "@/services/chat.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.view)(async (req: Request, context: any) => {
        const { tenantId, user } = context;
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get("chatId");
        const receiverId = searchParams.get("receiverId");
        const teacherId = searchParams.get("teacherId");
        const parentId = searchParams.get("parentId");

        let resolvedChatId = chatId;
        if (!resolvedChatId && receiverId && user?.uid) {
          resolvedChatId = [user.uid, receiverId].sort().join("_");
        }

        const service = new ChatService();
        const filter = resolvedChatId
          ? { chatId: resolvedChatId }
          : { teacherId: teacherId || undefined, parentId: parentId || undefined };

        const messages = await service.findByTenant(tenantId, filter);
        
        return createSuccessResponse(messages);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.send)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json().catch(() => ({}));
        const text = (body.text || body.message || "").trim();
        
        if (!text) {
          return createErrorResponse(400, "Message text is required");
        }

        let receiverId = body.receiverId;
        if (!receiverId && body.teacherId && body.parentId) {
          receiverId = user.uid === body.teacherId ? body.parentId : body.teacherId;
        }

        if (!receiverId) {
          return createErrorResponse(400, "Recipient ID is required");
        }

        const senderId = user.uid;
        const chatId = body.chatId || [senderId, receiverId].sort().join("_");
        
        const service = new ChatService();
        const id = await service.createMessage({
          chatId,
          senderId,
          receiverId,
          senderRole: user.role,
          senderUid: user.uid,
          tenantId,
          text,
          teacherId: body.teacherId || (user.role === "teacher" ? user.uid : receiverId),
          parentId: body.parentId || (user.role === "parent" ? user.uid : receiverId),
        });
        
        return createApiResponse(201, { id, chatId });
      })
    )
  )
);
