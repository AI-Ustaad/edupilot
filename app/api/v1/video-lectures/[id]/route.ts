export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { VideoLectureService } from "@/services/video-lecture.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.view)(async (req: Request, context: any) => {
        const tenantId = context?.tenantId;
        const id = context?.params?.id || getIdFromUrl(req);
        if (!id) return createErrorResponse(400, "Video ID is required");

        const service = new VideoLectureService();
        const lecture = await service.getById(id, tenantId);
        if (!lecture) return createErrorResponse(404, "Video lecture not found");
        return createSuccessResponse(lecture);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.create)(async (req: Request, context: any) => {
        const tenantId = context?.tenantId;
        const id = context?.params?.id || getIdFromUrl(req);
        if (!id) return createErrorResponse(400, "Video ID is required");

        const body = await req.json();
        const service = new VideoLectureService();
        const updated = await service.update(id, body, tenantId, context?.user?.uid);
        return createSuccessResponse(updated, { message: "Video lecture updated" });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.delete)(async (req: Request, context: any) => {
        const tenantId = context?.tenantId;
        const id = context?.params?.id || getIdFromUrl(req);
        if (!id) return createErrorResponse(400, "Video ID is required");

        const service = new VideoLectureService();
        await service.delete(id, tenantId, context?.user?.uid);
        return createSuccessResponse(null, { message: "Video lecture deleted successfully" });
      })
    )
  )
);
