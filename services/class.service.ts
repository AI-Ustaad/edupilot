// services/class.service.ts
import { ClassRepository } from "@/repositories/class.repository";
import { safeArray } from "@/lib/api/safeResponse";
import type { IClassService } from "@/interfaces/IClassService";

export class ClassService implements IClassService {
  private repo: ClassRepository;

  constructor(repo?: ClassRepository) {
    this.repo = repo ?? new ClassRepository();
  }

  async getAllClasses(tenantId: string) {
    const records = await this.repo.getAll(tenantId);
    return safeArray(records);
  }

  async createClass(data: { classGrade: string; sectionName: string; subjects?: { core: string[]; electives: string[] }; createdBy?: string }, tenantId: string) {
    return this.repo.createClass(data, tenantId);
  }

  async deleteClass(id: string, tenantId: string) {
    return this.repo.deleteClass(id, tenantId);
  }
}

export const classService = new ClassService();
