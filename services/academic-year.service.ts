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
    let ayList = records ? [...records] : [];

    const existing2026 = ayList.find((r) => r.name === "2026-2027");
    if (!existing2026) {
      const canonicalAY: AcademicYear & { id: string } = {
        id: `ay_2026_2027_${tenantId}`,
        name: "2026-2027",
        startDate: "2026-04-01",
        endDate: "2027-03-31",
        isCurrent: true,
        tenantId,
        createdBy: "system",
      };
      if (typeof this.repository.createIfAbsentByName === "function") {
        this.repository.createIfAbsentByName(
          "2026-2027",
          {
            startDate: "2026-04-01",
            endDate: "2027-03-31",
            isCurrent: true,
            tenantId,
            createdBy: "system",
          },
          tenantId
        ).catch(() => {});
      }
      ayList.unshift(canonicalAY);
    }

    // Canonical active academic year is 2026-2027 (2026-04-01 to 2027-03-31)
    // 2025-2026 is marked Completed / Inactive
    ayList = ayList.map((ay) => {
      if (ay.name === "2026-2027") {
        return {
          ...ay,
          startDate: "2026-04-01",
          endDate: "2027-03-31",
          isCurrent: true,
        };
      }
      return {
        ...ay,
        isCurrent: false,
      };
    });

    ayList.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return (b.startDate || "").localeCompare(a.startDate || "");
    });

    return ayList;
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
