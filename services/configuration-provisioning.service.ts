import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { DepartmentRepository } from "@/repositories/department.repository";
import type { IConfigurationProvisioningService, ProvisioningResult } from "@/interfaces/IConfigurationProvisioningService";
import type { MasterSchoolConfiguration } from "@/types/configuration";

export class ConfigurationProvisioningService implements IConfigurationProvisioningService {
  constructor(
    private readonly academicYearRepo: AcademicYearRepository,
    private readonly sectionRepo: SectionRepository,
    private readonly departmentRepo: DepartmentRepository
  ) {}

  async provisionFromConfiguration(
    tenantId: string,
    config: MasterSchoolConfiguration,
    userId: string
  ): Promise<ProvisioningResult> {
    const result: ProvisioningResult = {
      academicYearId: null,
      sectionsCreated: 0,
      departmentsCreated: 0,
      warnings: [],
    };

    // Publishing must not report success while its operational structure failed
    // to materialize. Let repository failures reach the caller so it can return
    // a real error and a retry can safely use the idempotent provisioning paths.
    result.academicYearId = await this.provisionAcademicYear(tenantId, config, userId);
    result.sectionsCreated = await this.provisionSections(tenantId, config, userId);
    result.departmentsCreated = await this.provisionDepartments(tenantId, config, userId);

    return result;
  }

  private async provisionAcademicYear(tenantId: string, _config: MasterSchoolConfiguration, userId: string): Promise<string | null> {
    const existing = await this.academicYearRepo.findAllByTenant(tenantId);
    const currentAY = existing.find((ay) => ay.isCurrent);

    if (currentAY) {
      return currentAY.id;
    }

    if (existing.length > 0) {
      const mostRecent = existing[0];
      await this.academicYearRepo.setCurrent(mostRecent.id, tenantId);
      return mostRecent.id;
    }

    const currentYear = new Date().getFullYear();
    const ayName = `${currentYear}-${currentYear + 1}`;
    const ayId = await this.academicYearRepo.createIfAbsentByName(
      ayName,
      {
        startDate: `${currentYear}-04-01`,
        endDate: `${currentYear + 1}-03-31`,
        isCurrent: true,
        tenantId,
        createdBy: userId,
      },
      tenantId
    );

    return ayId;
  }

  private async provisionSections(tenantId: string, config: MasterSchoolConfiguration, userId: string): Promise<number> {
    const classes = config.academic.classes || [];
    const sectionNames = config.academic.sectionNames?.length ? config.academic.sectionNames : ["A"];

    if (!classes.length) {
      return 0;
    }

    const structure: Array<{ classGrade: string; sectionName: string; subjects?: { core: string[]; electives: string[] } }> = [];

    for (const cls of classes) {
      const classGrade = cls.name;
      for (const sectionName of sectionNames) {
        structure.push({
          classGrade,
          sectionName,
          subjects: { core: cls.subjects || [], electives: [] },
        });
      }
    }

    return this.sectionRepo.createMissingSections(tenantId, structure, userId);
  }

  private async provisionDepartments(tenantId: string, config: MasterSchoolConfiguration, _userId: string): Promise<number> {
    const departments = (config.academic as any).departments;
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      return 0;
    }

    let created = 0;
    for (const dept of departments) {
      const name = typeof dept === "string" ? dept : dept?.name;
      if (!name) continue;

      const code =
        typeof dept === "object" && dept?.code
          ? dept.code
          : name.substring(0, Math.min(2, name.length)).toUpperCase();

      const description = typeof dept === "object" && dept?.description ? dept.description : "";

      const res = await this.departmentRepo.createAbsentByName(tenantId, name, {
        code,
        description,
        deleted: false,
      });
      if (res.created) {
        created++;
      }
    }

    return created;
  }
}

export const configurationProvisioningService = new ConfigurationProvisioningService(
  new AcademicYearRepository(),
  new SectionRepository(),
  new DepartmentRepository()
);
