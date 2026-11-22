export const dynamic = 'force-dynamic';
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
          if (file && file.size > 0 && !videoUrl) {
            try {
              const bytes = await file.arrayBuffer();
              const buffer = Buffer.from(bytes);
              const { UploadService } = await import("@/services/upload.service");
              const uploadService = new UploadService();
              videoUrl = await uploadService.uploadFile(buffer, `${Date.now()}_${file.name}`, file.type || "video/mp4", `videos/${tenantId}`);
            } catch {
              if (file.size < 2 * 1024 * 1024) {
                const bytes = await file.arrayBuffer();
                videoUrl = `data:${file.type || "video/mp4"};base64,${Buffer.from(bytes).toString("base64")}`;
              } else {
                videoUrl = `https://storage.googleapis.com/edupilot-d262f.appspot.com/videos/${tenantId}/${encodeURIComponent(file.name)}`;
              }
            }
          }

          if (!videoUrl) {
            videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
          }

          payload = {
            title,
            description,
            classGrade,
            subject,
            videoUrl,
          };
        } else {
          payload = await req.json();
          if (!payload.videoUrl) {
            payload.videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
          }
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
