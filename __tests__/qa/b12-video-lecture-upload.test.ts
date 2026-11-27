// __tests__/qa/b12-video-lecture-upload.test.ts
// B12 (26 Nov audit): the Video Library had no upload control at all, and
// the upload endpoint fabricated a storage URL for objects that were never
// stored (3.5s race timeout + fake-URL fallback), so "Watch Now" 404'd
// while the toast claimed success. Regression tests for the fixed upload
// path: the service must store the real uploaded URL verbatim and must
// never substitute a placeholder.
import { VideoLectureService } from "@/services/video-lecture.service";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

describe("B12: Video Lecture Upload", () => {
  const tenantId = "tenant_ghs_sahiwal";
  const userId = "user_admin_01";

  it("should ensure admin and teacher roles have videoLectures.create permission", () => {
    expect(ROLE_PERMISSIONS.admin).toContain("videoLectures.create");
    expect(ROLE_PERMISSIONS.teacher).toContain("videoLectures.create");
    expect(ROLE_PERMISSIONS.admin).toContain("videoLectures.view");
    expect(ROLE_PERMISSIONS.teacher).toContain("videoLectures.view");
  });

  it("should create a lecture storing the real uploaded videoUrl verbatim and log video.created", async () => {
    const realUrl =
      "https://firebasestorage.googleapis.com/v0/b/edupilot-d262f.appspot.com/o/videos%2Ftenant_ghs_sahiwal%2F123_lecture.mp4?alt=media&token=abc-123";
    const mockRepo = {
      create: jest.fn().mockResolvedValue("video-123"),
      findById: jest.fn().mockResolvedValue({
        id: "video-123",
        title: "Photosynthesis",
        classGrade: "Class 10",
        subject: "Biology",
        videoUrl: realUrl,
        tenantId,
      }),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const service = new VideoLectureService(mockRepo as any);
    const auditSpy = jest.spyOn((service as any).audit, "log").mockResolvedValue(undefined);

    const lecture = await service.create(
      {
        title: "Photosynthesis",
        description: "Intro to photosynthesis",
        classGrade: "Class 10",
        subject: "Biology",
        videoUrl: realUrl,
        schoolId: tenantId,
      },
      tenantId,
      userId
    );

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Photosynthesis", videoUrl: realUrl, tenantId }),
      tenantId
    );
    expect(lecture.videoUrl).toBe(realUrl);
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "video.created",
        entityId: "video-123",
        entityType: "video",
        tenantId,
      })
    );
  });

  it("should reject creation without a videoUrl instead of substituting a placeholder", async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    };
    const service = new VideoLectureService(mockRepo as any);

    await expect(
      service.create(
        {
          title: "Photosynthesis",
          classGrade: "Class 10",
          subject: "Biology",
          videoUrl: "",
          schoolId: tenantId,
        },
        tenantId,
        userId
      )
    ).rejects.toThrow("Video URL is required");

    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
