// services/homework.service.ts
import { HomeworkRepository } from "@/repositories/homework.repository";
import { Homework } from "@/types/homework";
import { createHomeworkSchema, updateHomeworkSchema } from "@/lib/validation";
import { ZodError } from "zod";

export class HomeworkService {
  constructor(private repo: HomeworkRepository) {}

  async createHomework(data: unknown, tenantId: string, userId: string): Promise<Homework> {
    let validated;
    try {
      validated = createHomeworkSchema.parse(data);
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
    } as Omit<Homework, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const record = await this.repo.findById(id, tenantId);
    if (!record) throw new Error("Homework not found after creation");
    return record as Homework;
  }

  async listHomework(tenantId: string): Promise<Homework[]> {
    return (await this.repo.findAll(tenantId)) as Homework[];
  }

  async getById(id: string, tenantId: string): Promise<Homework | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateHomework(id: string, data: unknown, tenantId: string): Promise<Homework> {
    let validated;
    try {
      validated = updateHomeworkSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    await this.repo.update(id, validated, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Homework not found after update");
    return updated as Homework;
  }

  async deleteHomework(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }
}
