export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { UploadService } from "@/services/upload.service";
import type { TenantContext } from "@/types/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return createErrorResponse(400, "No file provided");
      if (!ALLOWED_TYPES.includes(file.type)) {
        return createErrorResponse(400, "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF");
      }
      if (file.size > MAX_SIZE) {
        return createErrorResponse(400, "File too large. Maximum 5 MB");
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${tenantId}/${Date.now()}_${file.name}`;
      const uploadService = new UploadService();
      const publicUrl = await uploadService.uploadFile(buffer, fileName, file.type);

      return createSuccessResponse({ url: publicUrl });
    })
  )
);
