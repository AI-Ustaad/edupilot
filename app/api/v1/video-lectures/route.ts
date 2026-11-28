export const dynamic = 'force-dynamic';
// B12 rework: the route had no maxDuration, so a slow upload ran into the
// plan default and Vercel killed the invocation (504). The bytes now go
// straight from the browser to Storage, but the metadata POST still
// deserves headroom (same 60s the OCR route uses).
export const maxDuration = 60;
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { VideoLectureService } from "@/services/video-lecture.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new VideoLectureService();
        const lectures = await service.listAll(tenantId);
        return createSuccessResponse(lectures);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        let payload: any = {};
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
          const formData = await req.formData();
          const title = String(formData.get("title") || "").trim();
          const description = String(formData.get("description") || "").trim();
          const classGrade = String(formData.get("classGrade") || "").trim();
          const subject = String(formData.get("subject") || "").trim();
          let videoUrl = String(formData.get("videoUrl") || "").trim();

          const file = formData.get("file") as File | null;
          // B12: validate the required fields BEFORE touching storage so a
          // rejected upload never leaves an orphaned object in the bucket.
          if (!title || !classGrade || !subject) {
            return createErrorResponse(400, "Title, class and subject are required");
          }
          if (!file && !videoUrl) {
            return createErrorResponse(400, "A video file or a video URL is required");
          }
          if (file && file.size > 0 && !videoUrl) {
            const buffer = Buffer.from(await file.arrayBuffer());
            try {
              const { UploadService } = await import("@/services/upload.service");
              const uploadService = new UploadService();
              // B12: await the real storage write — no artificial race
              // timeout. A real video upload must finish (or fail honestly);
              // the old 3.5s race lost to any multi-MB file.
              videoUrl = await uploadService.uploadFile(buffer, `${Date.now()}_${file.name}`, file.type || "video/mp4", `videos/${tenantId}`, true);
            } catch {
              // Small files can be stored inline as a data URL and still
              // play back. Anything larger must fail honestly — never
              // record a storage URL for an object that was never stored
              // (the old code fabricated one here, so "Watch Now" 404'd
              // while the toast claimed success).
              if (file.size < 250 * 1024) {
                videoUrl = `data:${file.type || "video/mp4"};base64,${buffer.toString("base64")}`;
              } else {
                throw new Error("Video upload to storage failed. Please check your connection and try again.");
              }
            }
          }

          payload = {
            title,
            description,
            classGrade,
            subject,
            videoUrl,
            schoolId: tenantId,
          };
        } else {
          payload = await req.json();
          // B12: no placeholder video — a missing videoUrl must fail
          // validation honestly instead of silently attaching a sample clip.
          payload.schoolId = tenantId;
        }

        const service = new VideoLectureService();
        const lecture = await service.create(payload, tenantId, user.uid);
        return createApiResponse(201, lecture, "Video lecture created");
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const url = new URL(req.url);
        let id = url.searchParams.get("id");
        if (!id) {
          try {
            const body = await req.json();
            id = body.id;
          } catch {}
        }
        if (!id) {
          return createErrorResponse(400, "Video ID is required");
        }
        const service = new VideoLectureService();
        await service.delete(id, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Video lecture deleted successfully" });
      })
    )
  )
);
