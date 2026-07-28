import { adminDb } from "@/lib/firebase-admin";
import { mapToMasterConfiguration, mapToDbDocument } from "@/lib/mappers/configuration.mapper";
import { CONFIGURATION_DOC_ID, TenantMetadata } from "@/lib/configuration/constants";
import { logger } from "@/lib/logger/logger";
import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { IConfigurationRepository } from "@/interfaces/IConfigurationRepository";

export class ConfigurationRepository implements IConfigurationRepository {
  private getSettingsCollection(tenantId: string) {
    return adminDb.collection("tenants").doc(tenantId).collection("settings");
  }

  private getConfigRef(tenantId: string) {
    return this.getSettingsCollection(tenantId).doc(CONFIGURATION_DOC_ID);
  }

  private getHistoryCollection(tenantId: string) {
    return this.getConfigRef(tenantId).collection("history");
  }

  async getConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    try {
      const doc = await this.getConfigRef(tenantId).get();
      if (!doc.exists) {
        logger.info("CONFIGURATION_NOT_FOUND", { tenantId });
        return null;
      }

      const config = mapToMasterConfiguration(doc.data() as Record<string, any>, tenantId);
      logger.info("CONFIGURATION_LOADED", { tenantId, configId: config.id });
      return config;
    } catch (error) {
      logger.error("CONFIGURATION_LOAD_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return null;
    }
  }

  async getConfigurationById(tenantId: string, docId: string): Promise<MasterSchoolConfiguration | null> {
    try {
      const doc = await this.getSettingsCollection(tenantId).doc(docId).get();
      if (!doc.exists) return null;
      return mapToMasterConfiguration(doc.data() as Record<string, any>, tenantId);
    } catch (error) {
      logger.error("CONFIGURATION_LOAD_BY_ID_FAILED", {
        metadata: { tenantId, docId, error: error instanceof Error ? error.message : String(error) },
      });
      return null;
    }
  }

  async saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void> {
    try {
      config.id = CONFIGURATION_DOC_ID;
      config.tenantId = tenantId;
      config.metadata.tenantId = tenantId;

      if (!config.metadata.lastModified) {
        config.metadata.lastModified = new Date().toISOString();
      }

      const dbDocument = mapToDbDocument(config);
      await this.getConfigRef(tenantId).set(dbDocument, { merge: true });

      logger.info("CONFIGURATION_SAVED", { tenantId, version: config.version.number });
    } catch (error) {
      logger.error("CONFIGURATION_SAVE_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateConfiguration(tenantId: string, data: Partial<MasterSchoolConfiguration>): Promise<MasterSchoolConfiguration> {
    try {
      const dbDocument: Record<string, any> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await this.getConfigRef(tenantId).set(dbDocument, { merge: true });
      logger.info("CONFIGURATION_UPDATED", { tenantId });

      const updated = await this.getConfiguration(tenantId);
      if (!updated) {
        throw new Error("Configuration disappeared after update");
      }
      return updated;
    } catch (error) {
      logger.error("CONFIGURATION_UPDATE_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  async publishConfiguration(tenantId: string, config: MasterSchoolConfiguration, userId: string): Promise<MasterSchoolConfiguration> {
    try {
      config.state = "Published";
      config.metadata.isConfigured = true;
      config.metadata.configuredAt = new Date().toISOString();
      config.metadata.configuredBy = userId;
      config.metadata.publishedAt = new Date().toISOString();
      config.version.publishedBy = userId;
      config.version.publishedAt = new Date().toISOString();
      config.metadata.lastModified = new Date().toISOString();

      await this.saveConfiguration(tenantId, config);

      await this.addHistoryEntry(tenantId, config, userId, "Published via Smart Setup Wizard");

      logger.info("CONFIGURATION_PUBLISHED", { tenantId, version: config.version.number, userId });
      return config;
    } catch (error) {
      logger.error("CONFIGURATION_PUBLISH_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  async deleteConfiguration(tenantId: string): Promise<void> {
    try {
      await this.getConfigRef(tenantId).delete();
      logger.info("CONFIGURATION_DELETED", { tenantId });
    } catch (error) {
      logger.error("CONFIGURATION_DELETE_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      throw new Error(`Failed to delete configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async configurationExists(tenantId: string): Promise<boolean> {
    try {
      const doc = await this.getConfigRef(tenantId).get();
      return doc.exists;
    } catch (error) {
      logger.error("CONFIGURATION_EXISTS_CHECK_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return false;
    }
  }

  async loadCachedConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    const doc = await this.getConfigRef(tenantId).get();
    if (!doc.exists) return null;
    return mapToMasterConfiguration(doc.data() as Record<string, any>, tenantId);
  }

  async getConfigurationHistory(tenantId: string, limit: number = 50): Promise<MasterSchoolConfiguration[]> {
    try {
      const snapshot = await this.getHistoryCollection(tenantId)
        .orderBy("version.number", "desc")
        .limit(limit)
        .get();

      const history = snapshot.docs.map(doc => mapToMasterConfiguration({ ...doc.data(), id: doc.id }, tenantId));
      logger.info("CONFIGURATION_HISTORY_LOADED", { tenantId, count: history.length });
      return history;
    } catch (error) {
      logger.error("CONFIGURATION_HISTORY_LOAD_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return [];
    }
  }

  async getTenantMetadata(tenantId: string): Promise<TenantMetadata | null> {
    try {
      const config = await this.getConfiguration(tenantId);
      if (!config || !config.metadata) {
        return {
          tenantId,
          configurationVersion: 0,
          schemaVersion: 0,
          lastModified: new Date().toISOString(),
          environment: (process.env.NODE_ENV as TenantMetadata["environment"]) || "development",
          region: "default",
          timezone: "UTC",
        };
      }

      return {
        tenantId: config.metadata.tenantId,
        configuredAt: config.metadata.configuredAt,
        configuredBy: config.metadata.configuredBy,
        configurationVersion: config.metadata.configurationVersion,
        schemaVersion: config.metadata.schemaVersion,
        publishedAt: config.metadata.publishedAt,
        lastModified: config.metadata.lastModified,
        environment: config.metadata.environment as TenantMetadata["environment"],
        region: config.metadata.region,
        timezone: config.metadata.timezone,
      };
    } catch (error) {
      logger.error("TENANT_METADATA_LOAD_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return null;
    }
  }

  async updateTenantMetadata(tenantId: string, data: Partial<Omit<TenantMetadata, "tenantId">>): Promise<void> {
    try {
      const existingMetadata = await this.getTenantMetadata(tenantId);
      const updatedMetadata: TenantMetadata = {
        tenantId,
        configurationVersion: existingMetadata?.configurationVersion ?? 0,
        schemaVersion: existingMetadata?.schemaVersion ?? 0,
        lastModified: new Date().toISOString(),
        environment: existingMetadata?.environment ?? "development",
        region: existingMetadata?.region ?? "default",
        timezone: existingMetadata?.timezone ?? "UTC",
        ...data,
      };

      await this.getConfigRef(tenantId).set(
        {
          metadata: updatedMetadata,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      logger.error("TENANT_METADATA_UPDATE_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      throw new Error(`Failed to update tenant metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async addHistoryEntry(tenantId: string, config: MasterSchoolConfiguration, userId: string, reason: string): Promise<void> {
    try {
      const historyEntry = {
        id: config.version.id || `v_${config.version.number}`,
        versionNumber: config.version.number,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        reason,
        configuration: config,
      };

      await this.getHistoryCollection(tenantId).doc(historyEntry.id).set(historyEntry, { merge: true });
    } catch (error) {
      logger.error("CONFIGURATION_HISTORY_ENTRY_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
    }
  }
}