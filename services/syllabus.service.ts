// services/syllabus.service.ts
import { SyllabusRepository } from "@/repositories/syllabus.repository";
import type { ISyllabusRepository } from "@/interfaces/ISyllabusRepository";
import type { Syllabus } from "@/repositories/syllabus.repository";

export class SyllabusService {
  private repository: ISyllabusRepository;

  constructor(repository?: ISyllabusRepository) {
    this.repository = repository ?? new SyllabusRepository();
  }

  async findWithFilters(tenantId: string, filters?: { classGrade?: string; subject?: string }): Promise<(Syllabus & { id: string })[]> {
    return this.repository.findWithFilters(tenantId, filters);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    return this.repository.softDelete(id, tenantId);
  }

  async updateSyllabus(id: string, tenantId: string, data: Partial<Syllabus>): Promise<void> {
    return this.repository.updateSyllabus(id, tenantId, data);
  }
}
