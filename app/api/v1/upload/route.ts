export const dynamic = 'force-dynamic';
import { adminStorage } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return createApiResponse(400, null, "No file provided");
      if (!ALLOWED_TYPES.includes(file.type)) {
        return createApiResponse(400, null, "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF");
      }
      if (file.size > MAX_SIZE) {
        return createApiResponse(400, null, "File too large. Maximum 5 MB");
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${tenantId}/${Date.now()}_${file.name}`;
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(fileName);
      await fileRef.save(buffer, { contentType: file.type });
      await fileRef.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      return createApiResponse(200, { url: publicUrl });
    })
  )
);
