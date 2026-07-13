// services/class.service.ts
import { ClassRepository } from "@/repositories/class.repository";
import { safeArray } from "@/lib/api/safeResponse";

export class ClassService {
  private repo: ClassRepository;

  constructor(repo?: ClassRepository) {
    this.repo = repo ?? new ClassRepository();
  }

  async getAllClasses(tenantId: string) {
    const records = await this.repo.getAll(tenantId);
    return safeArray(records);
  }

  async createClass(data: { classGrade: string; sectionName: string }, tenantId: string) {
    return this.repo.createClass(data, tenantId);
  }

  async deleteClass(id: string, tenantId: string) {
    return this.repo.deleteClass(id, tenantId);
  }
}

export const classService = new ClassService();
