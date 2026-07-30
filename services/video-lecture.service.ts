import { VideoLectureRepository } from "@/repositories/video-lecture.repository";
import { VideoLecture } from "@/types/video-lecture";
import { createVideoLectureSchema, updateVideoLectureSchema } from "@/lib/validation";
import { AuditService } from "./AuditService";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import { ZodError } from "zod";
import type { IVideoLectureService } from "@/interfaces/IVideoLectureService";

export class VideoLectureService implements IVideoLectureService {
  private audit = new AuditService();

  constructor(private repo: VideoLectureRepository = new VideoLectureRepository()) {}

  async create(data: unknown, tenantId: string, userId: string): Promise<VideoLecture> {
    let validated;
    try {
      validated = createVideoLectureSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const createData = {
      ...validated,
      tenantId,
      createdBy: userId,
    } as Omit<VideoLecture, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const record = await this.repo.findById(id, tenantId);
    if (!record) throw new Error("Video lecture not found after creation");

    await this.audit.log({ action: "video.created", userId, tenantId, entityId: id, entityType: "video", metadata: { title: validated.title } });
    await invalidateCache(`videos:${tenantId}`);
    await eventBus.publish(EVENTS.VIDEO_CREATED, { tenantId, videoId: id, title: validated.title, createdBy: userId }, tenantId);

    return record as VideoLecture;
  }

  async listAll(tenantId: string): Promise<VideoLecture[]> {
    return (await this.repo.findAll(tenantId)) as VideoLecture[];
  }

  async getById(id: string, tenantId: string): Promise<VideoLecture | null> {
    return this.repo.findById(id, tenantId);
  }

  async update(id: string, data: unknown, tenantId: string, userId?: string): Promise<VideoLecture> {
    let validated;
    try {
      validated = updateVideoLectureSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
    await this.repo.update(id, validated, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Video lecture not found after update");

    await this.audit.log({ action: "video.updated", userId: userId || "system", tenantId, entityId: id, entityType: "video", metadata: { updates: validated } });
    await invalidateCache(`videos:${tenantId}`);
    await eventBus.publish(EVENTS.VIDEO_UPDATED, { tenantId, videoId: id, updates: validated, updatedBy: userId }, tenantId);

    return updated as VideoLecture;
  }

  async delete(id: string, tenantId: string, userId?: string): Promise<void> {
    await this.repo.delete(id, tenantId);

    await this.audit.log({ action: "video.deleted", userId: userId || "system", tenantId, entityId: id, entityType: "video" });
    await invalidateCache(`videos:${tenantId}`);
    await eventBus.publish(EVENTS.VIDEO_DELETED, { tenantId, videoId: id, deletedBy: userId }, tenantId);
  }
}
