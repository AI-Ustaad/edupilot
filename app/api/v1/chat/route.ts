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
        const { tenantId } = context;
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const parentId = searchParams.get("parentId");

        const service = new ChatService();
        const messages = await service.findByTenant(tenantId, teacherId || undefined, parentId || undefined);
        
        return createSuccessResponse(messages);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.chat.send)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { teacherId, parentId, text } = await req.json();
        
        if (!teacherId || !parentId || !text || !text.trim()) {
          return createErrorResponse(400, "Missing fields");
        }
        
        const service = new ChatService();
        const id = await service.createMessage({
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
