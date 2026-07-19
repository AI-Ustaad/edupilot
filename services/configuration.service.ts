// services/configuration.service.ts
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { MasterSchoolConfiguration } from "@/types/configuration";
import { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";
import { ConfigurationHistoryViewModel } from "@/types/viewmodels/configuration-history.viewmodel";
import { mapConfigurationToViewModel } from "@/lib/mappers/configuration.viewmodel.mapper";
import { mapHistory } from "@/lib/mappers/history.mapper";
import { CURRICULUMS } from "@/lib/curriculum-data";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger/logger";

export class ConfigurationService {
  constructor(private readonly repo = new ConfigurationRepository()) {}

  // 1. Get Configuration for UI (Returns ViewModel)
  async getConfigurationViewModel(tenantId: string): Promise<SchoolConfigurationViewModel | null> {
    const config = await this.repo.getActiveConfiguration(tenantId);
    return mapConfigurationToViewModel(config);
  }

  // 2. Get History for UI (Returns ViewModel Array)
  async getConfigurationHistoryViewModel(tenantId: string): Promise<ConfigurationHistoryViewModel[]> {
    const historyDocs = await this.repo.getConfigurationHistory(tenantId);
    return mapHistory(historyDocs);
  }

  // 3. Save Configuration (Business Logic + Validation)
  async saveAndPublishConfiguration(
    input: any, // Ideally strongly typed from Zod schema
    tenantId: string,
    userId: string
  ): Promise<MasterSchoolConfiguration> {
    
    // Business Rules Validation
    const curriculum = CURRICULUMS.find((item) => item.id === input.curriculumId);
    if (!curriculum) throw new Error("Selected education board is not supported");

    if (input.schoolType === "Government" && !["federal", "punjab"].includes(curriculum.id)) {
      throw new Error("Government schools must use a supported government board");
    }
    if (input.schoolType === "Madrissa" && curriculum.id !== "wifaq") {
      throw new Error("Madrissa schools must use the Wifaq curriculum");
    }

    // Get Previous Config to increment version
    const previous = await this.repo.getActiveConfiguration(tenantId);
    const previousVersion = previous?.version?.number || 0;

    // Build Academic Structure
    const levels = [...new Set(input.levels)];
    const classes = levels.flatMap((level: string) => 
      (curriculum.levels[level as keyof typeof curriculum.levels] || []).map((item: any) => ({
        id: `cls_${level}_${item.name}`.toLowerCase(),
        name: item.name,
        level: level,
        subjects: item.subjects.map((s: any) => s.name)
      }))
    );

    if (!classes.length) throw new Error("The selected board does not define classes for the selected levels");

    const sectionNames = input.sectionNames?.length ? input.sectionNames : ["A"];
    const subjects = [...new Set(classes.flatMap((c: any) => c.subjects))];

    // Build new Master Configuration Object
    const now = new Date().toISOString();
    const newConfig: MasterSchoolConfiguration = {
      id: "current",
      tenantId: tenantId,
      state: "Published",
      metadata: {
        tenantId: tenantId,
        schemaVersion: 2,
        configurationVersion: previousVersion + 1,
        environment: process.env.NODE_ENV as any || "development",
        region: "PK",
        timezone: "Asia/Karachi",
        academicYearId: previous?.metadata.academicYearId || null,
        currentSnapshotId: null,
      },
      version: {
        id: randomUUID(),
        number: previousVersion + 1,
        createdBy: userId,
        createdAt: now,
        publishedBy: userId,
        publishedAt: now,
        reason: "Saved and published via UI",
        checksum: `ck_${Date.now()}`,
      },
      school: {
        name: input.schoolName,
        type: input.schoolType,
        curriculumId: input.curriculumId,
        boardName: curriculum.name,
        country: input.country || "PK",
      },
      academic: {
        levels,
        classes: classes as any,
        sectionNames,
        subjects,
      },
      features: previous?.features || {
        ai: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false, providers: ["gemini"], activeProvider: "gemini", quota: 1000 },
        library: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
        transport: { enabled: false, version: "1.0", permissions: ["admin"], beta: false },
        fees: { enabled: true, version: "1.0", permissions: ["admin", "accountant"], beta: false },
        attendance: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
        exams: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
      },
    };

    // Save to DB via Repository
    await this.repo.saveConfiguration(tenantId, newConfig);
    logger.info("CONFIGURATION_PUBLISHED", { tenantId, version: newConfig.version.number, userId });
    
    return newConfig;
  }
}

// Export singleton instance
export const configurationService = new ConfigurationService();
