import { logger } from "@/lib/logger/logger";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";
import { ConfigurationHealthService } from "@/services/configuration-health.service";
import { mapConfigurationToViewModel, mapHistory } from "@/lib/mappers";
import { ConfigurationInvalidError, ConfigurationValidationError } from "@/lib/errors/configuration.errors";
import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { SchoolConfigurationViewModel, ConfigurationHistoryViewModel } from "@/types/viewmodels";
import type { ConfigurationLoadResult, ConfigurationStatus, ConfigurationHealthResult } from "@/types/configuration/status";
import type { IConfigurationService } from "@/interfaces/IConfigurationService";
import type { WizardInput } from "@/types/configuration/wizard";
import { createVersion, buildDefaultConfiguration } from "@/types/configuration/wizard";

export class ConfigurationService implements IConfigurationService {
  constructor(
    private readonly repo = new ConfigurationRepository(),
    private readonly cache = new ConfigurationCacheService(),
    private readonly healthService = new ConfigurationHealthService()
  ) {}

  async getConfigurationViewModel(tenantId: string): Promise<SchoolConfigurationViewModel | null> {
    const cached = await this.cache.getConfiguration(tenantId);
    if (cached) {
      logger.info("CONFIGURATION_CACHE_HIT", { tenantId });
      return cached;
    }

    const config = await this.repo.getConfiguration(tenantId);
    if (config) {
      await this.cache.setConfiguration(tenantId, config);
      logger.info("CONFIGURATION_LOADED", { tenantId });
    }

    const viewModel = mapConfigurationToViewModel(config);
    return viewModel;
  }

  async getConfigurationHistoryViewModel(tenantId: string, limit: number = 50): Promise<ConfigurationHistoryViewModel[]> {
    const historyDocs = await this.repo.getConfigurationHistory(tenantId, limit);
    return mapHistory(historyDocs);
  }

  async getConfigurationHistoryViewModelLegacy(tenantId: string): Promise<ConfigurationHistoryViewModel[]> {
    return this.getConfigurationHistoryViewModel(tenantId);
  }

  async loadConfiguration(tenantId: string): Promise<ConfigurationLoadResult> {
    try {
      const health = await this.healthService.checkHealth(tenantId);

      if (health.status === "NOT_CONFIGURED") {
        return {
          status: "NOT_CONFIGURED",
          configuration: null,
          diagnostics: health.diagnostics,
          nextAction: health.nextAction,
        };
      }

      const config = await this.cache.getConfiguration(tenantId);
      if (config) {
        logger.info("CONFIGURATION_CACHE_HIT", { tenantId });
        return {
          status: health.status,
          configuration: config,
          diagnostics: health.diagnostics,
        };
      }

      const dbConfig = await this.repo.getConfiguration(tenantId);
      if (dbConfig) {
        await this.cache.setConfiguration(tenantId, dbConfig);
        logger.info("CONFIGURATION_LOADED", { tenantId });
      }

      return {
        status: health.status,
        configuration: dbConfig,
        diagnostics: health.diagnostics,
        nextAction: health.nextAction,
      };
    } catch (error) {
      logger.error("CONFIGURATION_LOAD_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return {
        status: "INVALID",
        configuration: null,
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: false,
          schemaValid: false,
        },
        nextAction: "Contact support to resolve configuration issues",
      };
    }
  }

  async saveAndPublishConfiguration(input: WizardInput, tenantId: string, userId: string): Promise<MasterSchoolConfiguration> {
    try {
      const existing = await this.repo.getConfiguration(tenantId);
      const previousVersion = existing?.version.number || 0;
      const { schoolProfile, academicStructure } = input;

      if (!academicStructure || !academicStructure.grades || academicStructure.grades.length === 0) {
        throw new ConfigurationValidationError("Validation Failed: No classes/grades were generated.");
      }

      if (!academicStructure.allSubjects || academicStructure.allSubjects.length === 0) {
        throw new ConfigurationValidationError("Validation Failed: No subjects were found for the selected curriculum.");
      }

      const sectionNames: string[] = schoolProfile.sections?.length ? schoolProfile.sections : ["A"];

      const mappedClasses = academicStructure.grades.map((g: any) => ({
        id: g.id || `cls_${g.name}`,
        name: g.name,
        level: g.levelId || g.level || "general",
        subjects: g.schemeOfStudy?.subjects?.map((s: any) => s.name || s.subjectId) || []
      }));

      const newConfig: MasterSchoolConfiguration = {
        id: "current",
        tenantId: tenantId,
        state: "Published",
        metadata: {
          tenantId: tenantId,
          schemaVersion: 2,
          configurationVersion: previousVersion + 1,
          environment: (process.env.NODE_ENV as any) || "development",
          region: "default",
          timezone: "UTC",
          academicYearId: existing?.metadata.academicYearId || null,
          currentSnapshotId: null,
          isConfigured: true,
          configuredAt: new Date().toISOString(),
          configuredBy: userId,
          lastModified: new Date().toISOString(),
        },
        version: createVersion(previousVersion + 1, userId, "Configured via Smart Setup Wizard"),
        school: {
          name: schoolProfile.name || "Untitled School",
          type: (schoolProfile.type as "Private" | "Government" | "Madrissa") || "Private",
          curriculumId: schoolProfile.curriculumId || "custom",
          boardName: schoolProfile.boardName || "Custom Board",
          country: schoolProfile.country || "PK",
        },
        academic: {
          levels: academicStructure.levels.map((l: any) => l.id || l.name),
          classes: mappedClasses,
          sectionNames,
          subjects: academicStructure.allSubjects.map((s: any) => s.name),
          requiredLabs: academicStructure.requiredLabs || [],
          requiredTeachers: academicStructure.requiredTeachers || {},
        },
        features: existing?.features || {
          ai: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false, providers: ["gemini"], activeProvider: "gemini", quota: 1000 },
          library: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
          transport: { enabled: false, version: "1.0", permissions: ["admin"], beta: false },
          fees: { enabled: true, version: "1.0", permissions: ["admin", "accountant"], beta: false },
          attendance: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
          exams: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
        },
      };

      await this.repo.publishConfiguration(tenantId, newConfig, userId);
      await this.cache.invalidateConfiguration(tenantId);
      await this.cache.setConfiguration(tenantId, newConfig);

      eventBus.publish(EVENTS.SCHOOL_SETUP_COMPLETED, {
        tenantId,
        schoolName: newConfig.school.name,
        classesCount: newConfig.academic.classes.length,
        subjectsCount: newConfig.academic.subjects.length,
        createdBy: userId,
      }, tenantId);

      logger.info("CONFIGURATION_PUBLISHED", { tenantId, version: newConfig.version.number, userId });
      return newConfig;
    } catch (error) {
      if (error instanceof ConfigurationValidationError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      logger.error("CONFIGURATION_SAVE_FAILED", {
        metadata: { tenantId, userId, error: message },
      });
      throw new ConfigurationInvalidError(`Failed to save configuration: ${message}`);
    }
  }

  async getHealthStatus(tenantId: string): Promise<ConfigurationHealthResult> {
    return this.healthService.checkHealth(tenantId);
  }

  async createDefaultConfiguration(tenantId: string, userId: string): Promise<MasterSchoolConfiguration> {
    try {
      const defaultConfig = buildDefaultConfiguration(tenantId, userId);
      await this.repo.saveConfiguration(tenantId, defaultConfig);
      await this.cache.setConfiguration(tenantId, defaultConfig);

      logger.info("DEFAULT_CONFIGURATION_CREATED", { tenantId, userId });
      return defaultConfig;
    } catch (error) {
      logger.error("DEFAULT_CONFIGURATION_CREATION_FAILED", {
        metadata: { tenantId, userId, error: error instanceof Error ? error.message : String(error) },
      });
      throw new ConfigurationInvalidError(`Failed to create default configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getConfigurationForSetup(tenantId: string): Promise<SchoolConfigurationViewModel | null> {
    return this.getConfigurationViewModel(tenantId);
  }
}

export const configurationService = new ConfigurationService();
