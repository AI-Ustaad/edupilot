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
    const records = await this.repository.findAllByTenant(tenantId);
    if (!records || records.length === 0) {
      const canonicalAY: AcademicYear & { id: string } = {
        id: `ay_2025_2026_${tenantId}`,
        name: "2025-2026",
        startDate: "2025-08-01",
        endDate: "2026-06-30",
        isCurrent: true,
        tenantId,
        createdBy: "system",
      };
      return [canonicalAY];
    }
    const hasCurrent = records.some((r) => r.isCurrent);
    if (!hasCurrent && records.length > 0) {
      records[0].isCurrent = true;
    }
    return records;
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
