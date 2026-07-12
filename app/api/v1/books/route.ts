export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { BookService } from "@/services/book.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.bookCenter.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new BookService();
        const url = new URL(req.url);
        const classGrade = url.searchParams.get("classGrade") || undefined;
        const subject = url.searchParams.get("subject") || undefined;

        const books = await service.listBooks(tenantId, { classGrade, subject });
        return createSuccessResponse(books);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.bookCenter.create)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new BookService();
        const body = await req.json();
        const book = await service.createBook(body, tenantId);
        return createApiResponse(201, book, "Book added successfully");
      })
    )
  )
);
