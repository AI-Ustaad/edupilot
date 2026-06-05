export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { VideoLectureService } from "@/services/video-lecture.service";
import { VideoLectureRepository } from "@/repositories/video-lecture.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new VideoLectureService(new VideoLectureRepository());
        const lectures = await service.listAll(tenantId);
        return createApiResponse(200, lectures);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.videoLectures.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new VideoLectureService(new VideoLectureRepository());
        const lecture = await service.create(body, tenantId, user.uid);
        return createApiResponse(201, lecture, "Video lecture created");
      })
    )
  )
);
