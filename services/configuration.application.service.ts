// services/configuration.application.service.ts
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationDomainService } from "@/services/configuration.domain.service";
import { MasterSchoolConfiguration } from "@/types/configuration";
import { SchoolConfigurationInput } from "@/types/school-configuration";
import { CURRICULUMS } from "@/lib/curriculum-data";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger/logger";

export class ConfigurationApplicationService {
  constructor(
    private readonly repo = new ConfigurationRepository(),
    private readonly domain = new ConfigurationDomainService()
  ) {}

  async getConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    return this.repo.getActiveConfiguration(tenantId);
  }

  async getHistory(tenantId: string): Promise<MasterSchoolConfiguration[]> {
    return this.repo.getConfigurationHistory(tenantId);
  }

  // 🟢 Save Or Publish Configuration from UI Input
  async saveAndPublishConfiguration(
    input: SchoolConfigurationInput,
    tenantId: string,
    userId: string
  ): Promise<MasterSchoolConfiguration> {
    
    // 1. Validate Business Rules (Government -> Federal/Punjab, etc.)
    this.domain.validateBusinessRules(input);

    // 2. Get Previous Config
    const previous = await this.repo.getActiveConfiguration(tenantId);
    const previousVersion = previous?.version?.number || 0;

    // 3. Build new Master Configuration Object
    const now = new Date().toISOString();
    const newConfig: MasterSchoolConfiguration = {
      id: "current",
      tenantId: tenantId,
      state: "Published", // Auto-publish from UI for now
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
        boardName: CURRICULUMS.find(c => c.id === input.curriculumId)?.name || "",
        country: input.country || "PK",
      },
      academic: this.domain.buildAcademicStructure(input),
      features: previous?.features || this.domain.getDefaultFeatures(),
    };

    // 4. Save to DB
    await this.repo.saveConfiguration(tenantId, newConfig);
    logger.info("CONFIGURATION_PUBLISHED", { tenantId, version: newConfig.version.number, userId });
    
    return newConfig;
  }
}

// Export singleton instance
export const configurationAppService = new ConfigurationApplicationService();
