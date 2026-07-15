import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { MasterSchoolConfiguration } from "@/types/configuration";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger/logger";

export class ConfigurationService {
  constructor(private repo = new ConfigurationRepository()) {}

  // 🟢 1. Create or Update Draft Version
  async saveDraft(tenantId: string, userId: string, payload: Partial<MasterSchoolConfiguration>, reason: string): Promise<MasterSchoolConfiguration> {
    let current = await this.repo.getActiveConfiguration(tenantId);
    const now = new Date().toISOString();
    const newVersionNumber = current ? current.version.number + 1 : 1;

    // Build the new Master Object
    const newConfig: MasterSchoolConfiguration = {
      ...current,
      ...payload,
      id: "current",
      tenantId,
      state: "Draft",
      metadata: {
        tenantId,
        schemaVersion: 1,
        configurationVersion: newVersionNumber,
        environment: process.env.NODE_ENV as any || "development",
        region: "PK",
        timezone: "Asia/Karachi",
        academicYearId: current?.metadata.academicYearId || null,
        currentSnapshotId: null,
      },
      version: {
        id: randomUUID(),
        number: newVersionNumber,
        createdBy: userId,
        createdAt: now,
        reason: reason,
        checksum: "calculated_hash_here", // Future proofing
      }
    } as MasterSchoolConfiguration;

    await this.repo.saveConfiguration(tenantId, newConfig);
    logger.info("CONFIGURATION_DRAFT_SAVED", { tenantId, version: newVersionNumber, userId });
    
    return newConfig;
  }

  // 🟢 2. Publish Configuration (Only Published config is read by modules)
  async publishConfiguration(tenantId: string, userId: string): Promise<void> {
    const current = await this.repo.getActiveConfiguration(tenantId);
    if (!current || current.state !== "Draft") {
      throw new Error("Only Draft configurations can be published.");
    }

    // Lock Dependencies Check can be injected here in the future

    current.state = "Published";
    current.version.publishedBy = userId;
    current.version.publishedAt = new Date().toISOString();

    await this.repo.saveConfiguration(tenantId, current);
    
    // Publish Event to EventBus here: eventBus.publish("CONFIG_PUBLISHED", { tenantId })
    logger.info("CONFIGURATION_PUBLISHED", { tenantId, version: current.version.number, userId });
  }
}
