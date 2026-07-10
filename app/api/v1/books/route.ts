export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { BookService } from "@/services/book.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

const bookService = new BookService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.bookCenter.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const classGrade = url.searchParams.get("classGrade") || undefined;
        const subject = url.searchParams.get("subject") || undefined;

        const books = await bookService.listBooks(tenantId, { classGrade, subject });
        return createSuccessResponse(books);
      })
    )
  )
);
