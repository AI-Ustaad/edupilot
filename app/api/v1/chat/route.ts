export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { ChatRepository } from "@/repositories/chat.repository";

const chatRepo = new ChatRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.view)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const parentId = searchParams.get("parentId");

        const messages = await chatRepo.findByTenant(tenantId, teacherId || undefined, parentId || undefined);
        
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
        
        const id = await chatRepo.createMessage({
          teacherId,
          parentId,
          text: text.trim(),
          senderRole: user.role,
          senderUid: user.uid,
          tenantId,
        });
        
        return createApiResponse(201, { id });
      })
    )
  )
);
