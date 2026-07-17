export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { BookService } from "@/services/book.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.bookCenter.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const service = new BookService();
        const id = getIdFromUrl(req);
        const body = await req.json();
        await service.updateBook(id, body, tenantId, user.uid);
        return createSuccessResponse({ success: true });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.bookCenter.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const service = new BookService();
        const id = getIdFromUrl(req);
        const book = await service.getBookById(id, tenantId);
        if (!book) return createErrorResponse(404, "Book not found");
        await service.deleteBook(id, tenantId, user.uid);
        return createSuccessResponse({ success: true });
      })
    )
  )
);
