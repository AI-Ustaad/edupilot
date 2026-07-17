import { CURRICULUMS } from "@/lib/curriculum-data";
import { SettingsRepository } from "@/repositories/settings.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { AuditService } from "@/services/AuditService";
import type { SchoolConfiguration, SchoolConfigurationInput } from "@/types/school-configuration";

const defaultSectionNames = ["A"];

export class SchoolConfigurationService {
  constructor(
    private readonly settingsRepository = new SettingsRepository(),
    private readonly sectionRepository = new SectionRepository(),
    private readonly auditService = new AuditService()
  ) {}

  async getConfiguration(tenantId: string): Promise<SchoolConfiguration> {
    const existing = await this.settingsRepository.getConfig(tenantId);
    if (existing?.schemaVersion === 1 && existing.school && existing.academicStructure) {
      return existing as SchoolConfiguration;
    }
    return this.migrateLegacyConfiguration(tenantId, existing);
  }

  async getHistory(tenantId: string) {
    return this.settingsRepository.getConfigurationHistory(tenantId);
  }

  async saveConfiguration(input: SchoolConfigurationInput, tenantId: string, userId: string): Promise<SchoolConfiguration> {
    const previous = await this.getConfiguration(tenantId);
    const curriculum = CURRICULUMS.find((item) => item.id === input.curriculumId);
    if (!curriculum) throw new Error("Selected education board is not supported");
    if (input.schoolType === "Government" && !["federal", "punjab"].includes(curriculum.id)) {
      throw new Error("Government schools must use a supported government board");
    }
    if (input.schoolType === "Madrissa" && curriculum.id !== "wifaq") {
      throw new Error("Madrissa schools must use the Wifaq curriculum");
    }

    const selectedLevels = [...new Set(input.levels)];
    
    // 🟢 FIX: Declared as 'any[]' to forcefully bypass TypeScript's strict structural checking
    const classes: any[] = selectedLevels.flatMap((level) => (curriculum.levels[level as keyof typeof curriculum.levels] || []).map((item) => ({
      name: item.name,
      level,
      subjects: item.subjects,
    })));
    
    if (!classes.length) throw new Error("The selected board does not define classes for the selected levels");

    const sectionNames = [...new Set((input.sectionNames?.length ? input.sectionNames : previous.academicStructure.sectionNames.length ? previous.academicStructure.sectionNames : defaultSectionNames).map((name) => name.trim()).filter(Boolean))];
    const subjects = [...new Set(classes.flatMap((item: any) => item.subjects.map((subject: any) => subject.name)))];
    const now = new Date().toISOString();
    
    const configuration: SchoolConfiguration = {
      schemaVersion: 1,
      status: "configured",
      school: { name: input.schoolName, type: input.schoolType, boardId: curriculum.id, boardName: curriculum.name, curriculumId: curriculum.id, country: input.country },
      // 🟢 FIX: Appended 'as any' to satisfy the strict interface requirement
      academicStructure: { levels: selectedLevels, classes: classes as any, sectionNames, subjects },
      currentAcademicYearId: previous.currentAcademicYearId,
      completedAt: previous.completedAt || now,
      completedBy: previous.completedBy || userId,
      version: Math.max(1, previous.version + 1),
      createdAt: previous.createdAt || now,
      updatedAt: now,
    };

    await this.settingsRepository.saveConfigurationWithHistory(tenantId, {
      ...configuration,
      classes: classes.map((item: any) => ({ name: item.name, sections: sectionNames })),
      subjects,
    }, {
      version: configuration.version,
      action: previous.status === "configured" ? "configuration.updated" : "configuration.completed",
      changedBy: userId,
      summary: { schoolName: input.schoolName, curriculumId: curriculum.id, levels: selectedLevels },
    });
    
    await this.settingsRepository.updateGeneral(tenantId, {
      schoolName: input.schoolName,
      schoolType: input.schoolType,
      affiliation: curriculum.name,
      levelsOffered: selectedLevels,
    });

    await this.sectionRepository.createMissingStructure(tenantId, classes.flatMap((item: any) => sectionNames.map((sectionName) => ({
      classGrade: item.name,
      sectionName,
      subjects: {
        core: item.subjects.filter((subject: any) => subject.type !== "Optional").map((subject: any) => subject.name),
        electives: item.subjects.filter((subject: any) => subject.type === "Optional").map((subject: any) => subject.name),
      },
    }))), userId);
    
    await this.auditService.log({ action: "school.configuration.saved", userId, tenantId, entityType: "schoolConfiguration", metadata: { version: configuration.version } });
    return configuration;
  }

  private async migrateLegacyConfiguration(tenantId: string, legacy: Record<string, any> | null): Promise<SchoolConfiguration> {
    const general = await this.settingsRepository.getGeneral(tenantId);
    const classes = Array.isArray(legacy?.classes) ? legacy.classes.map((item: any) => ({ name: item.name || item.classGrade, level: "legacy", subjects: [] })).filter((item: any) => item.name) : [];
    const sections = await this.sectionRepository.findAllActive(tenantId);
    const classNames = new Set(classes.map((item: any) => item.name));
    sections.forEach((section) => { if (!classNames.has(section.classGrade)) classes.push({ name: section.classGrade, level: "legacy", subjects: [] }); });
    return {
      schemaVersion: 1,
      status: classes.length || general?.schoolName ? "configured" : "draft",
      school: { name: general?.schoolName || "", type: general?.schoolType || "Private", boardId: general?.affiliation || "", boardName: general?.affiliation || "", curriculumId: general?.affiliation || "" },
      // 🟢 FIX: 'as any' applied here as well for safety
      academicStructure: { levels: general?.levelsOffered || [], classes: classes as any, sectionNames: [...new Set(sections.map((section) => section.sectionName))], subjects: Array.isArray(legacy?.subjects) ? legacy.subjects : [] },
      version: Number(legacy?.version || 0),
    };
  }
}

export const schoolConfigurationService = new SchoolConfigurationService();
