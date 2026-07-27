// interfaces/IVideoLectureService.ts
import type { VideoLecture } from "@/types/video-lecture";

export interface IVideoLectureService {
  create(data: unknown, tenantId: string, userId: string): Promise<VideoLecture>;
  listAll(tenantId: string): Promise<VideoLecture[]>;
  getById(id: string, tenantId: string): Promise<VideoLecture | null>;
  update(id: string, data: unknown, tenantId: string, userId?: string): Promise<VideoLecture>;
  delete(id: string, tenantId: string, userId?: string): Promise<void>;
}
