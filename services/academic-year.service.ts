// services/academic-year.service.ts
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import type { IAcademicYearRepository } from "@/interfaces/IAcademicYearRepository";
import type { AcademicYear } from "@/repositories/academic-year.repository";

export class AcademicYearService {
  private repository: IAcademicYearRepository;

  constructor(repository?: IAcademicYearRepository) {
    this.repository = repository ?? new AcademicYearRepository();
  }

  async findAll(tenantId: string): Promise<(AcademicYear & { id: string })[]> {
    return this.repository.findAllByTenant(tenantId);
  }

  async findById(id: string, tenantId: string): Promise<(AcademicYear & { id: string }) | null> {
    return this.repository.findById(id, tenantId);
  }

  async create(data: AcademicYear, tenantId: string, userId: string): Promise<string> {
    const isCurrent = !!data.isCurrent;
    if (isCurrent) {
      await this.repository.setCurrent("", tenantId);
    }
    const id = await this.repository.create(data as any, tenantId);
    if (isCurrent) {
      await this.repository.setCurrent(id, tenantId);
    }
    return id;
  }
}
