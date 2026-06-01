import { VideoLectureRepository } from "@/repositories/video-lecture.repository";
import { VideoLecture } from "@/types/video-lecture";
import { createVideoLectureSchema, updateVideoLectureSchema } from "@/lib/validation";
import { ZodError } from "zod";

export class VideoLectureService {
  constructor(private repo: VideoLectureRepository) {}

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
    return record as VideoLecture;
  }

  async listAll(tenantId: string): Promise<VideoLecture[]> {
    return (await this.repo.findAll(tenantId)) as VideoLecture[];
  }

  async getById(id: string, tenantId: string): Promise<VideoLecture | null> {
    return this.repo.findById(id, tenantId);
  }

  async update(id: string, data: unknown, tenantId: string): Promise<VideoLecture> {
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
    return updated as VideoLecture;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }
}
