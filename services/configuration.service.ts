import { logger } from "@/lib/logger/logger";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";
import { ConfigurationHealthService } from "@/services/configuration-health.service";
import { TenantService } from "@/services/tenant.service";
import type { ITenantService } from "@/interfaces/ITenantService";
import { versionEngine, type UpgradeCheckResult } from "@/education/engines/version.engine";
import { mapConfigurationToViewModel, mapHistory } from "@/lib/mappers";
import { ConfigurationInvalidError, ConfigurationValidationError, ConfigurationNotFoundError } from "@/lib/errors/configuration.errors";
import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { SchoolConfigurationViewModel, ConfigurationHistoryViewModel } from "@/types/viewmodels";
import type { ConfigurationLoadResult, ConfigurationStatus, ConfigurationHealthResult } from "@/types/configuration/status";
import type { IConfigurationService } from "@/interfaces/IConfigurationService";
import type { WizardInput } from "@/types/configuration/wizard";
import { createVersion, buildDefaultConfiguration } from "@/types/configuration/wizard";
import { nowISO } from "@/lib/date";
import { configurationProvisioningService } from "@/services/configuration-provisioning.service";
import type { IConfigurationProvisioningService } from "@/interfaces/IConfigurationProvisioningService";
import { adminDb } from "@/lib/firebase-admin";

export class ConfigurationService implements IConfigurationService {
  constructor(
    private readonly repo = new ConfigurationRepository(),
    private readonly cache = new ConfigurationCacheService(),
    private readonly healthService = new ConfigurationHealthService(),
    private readonly provisioningService: IConfigurationProvisioningService = configurationProvisioningService,
    private readonly tenantService: ITenantService = new TenantService()
  ) {}

  async getConfigurationViewModel(tenantId: string): Promise<SchoolConfigurationViewModel | null> {
    const cached = await this.cache.getConfiguration(tenantId);
    let config = cached;
    if (!config) {
      config = await this.repo.getConfiguration(tenantId);
      if (config) {
        await this.cache.setConfiguration(tenantId, config);
        logger.info("CONFIGURATION_LOADED", { tenantId });
      }
    }

    const db = (this.repo as any).db || adminDb;

    // Self-healing / reconciliation with tenant doc and classes/sections
    let tenantData: any = null;
    try {
      if (db?.collection) {
        const tSnap = await db.collection("tenants").doc(tenantId).get();
        if (tSnap.exists) {
          tenantData = tSnap.data();
        }
      }
    } catch {
      // non-fatal
    }

    if (!config && tenantData) {
      config = {
        id: `config_${tenantId}`,
        tenantId,
        state: "Published",
        metadata: {
          tenantId,
          schemaVersion: 2,
          configurationVersion: 1,
          environment: "production",
          region: "default",
          timezone: "UTC",
          academicYearId: tenantData.academicYearId || tenantData.academicYear || "ay-2026",
          currentSnapshotId: null,
          isConfigured: true,
          configuredAt: new Date().toISOString(),
          configuredBy: "system",
          publishedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
        version: {
          id: "v_1",
          number: 1,
          createdBy: "system",
          createdAt: new Date().toISOString(),
          publishedBy: "system",
          publishedAt: new Date().toISOString(),
          reason: "Auto-reconciled from tenant profile",
          checksum: "checksum_1",
        },
        school: {
          name: tenantData.name || tenantData.schoolName || "Test Secondary School - EduPilot QA",
          type: tenantData.type || "Private",
          curriculumId: tenantData.curriculumId || "federal",
          boardName: tenantData.boardName || "Private School (SNC Based)",
          country: tenantData.country || "PK",
        },
        academic: {
          levels: ["Primary", "Secondary"],
          classes: [],
          sectionNames: ["A", "B", "C"],
          subjects: [],
          requiredLabs: [],
          requiredTeachers: {},
        },
        features: {} as any,
      };
    }

    if (config) {
      // Fallback school profile fields
      if (!config.school) config.school = {} as any;
      const existingName = config.school.name || (config as any).schoolName;
      if (existingName && existingName !== "Unknown School" && existingName !== "N/A") {
        config.school.name = existingName;
      } else if (tenantData?.name || tenantData?.schoolName) {
        config.school.name = tenantData.name || tenantData.schoolName;
      }

      if (!config.school.type || config.school.type === "N/A") {
        config.school.type = (config as any).schoolType || tenantData?.type || "Private";
      }
      if (!config.school.boardName || config.school.boardName === "N/A") {
        config.school.boardName = (config as any).boardName || tenantData?.boardName || "Private School (SNC Based)";
      }
      if (!config.school.country || config.school.country === "N/A") {
        config.school.country = (config as any).country || tenantData?.country || "PK";
      }

      // Fallback classes if empty
      if (!config.academic) config.academic = {} as any;
      if (!config.academic.classes || config.academic.classes.length === 0) {
        try {
          if (db?.collection) {
            const classesSnap = await db.collection("classes").where("tenantId", "==", tenantId).get();
            if (!classesSnap.empty) {
              const uniqueClasses = new Map<string, any>();
              classesSnap.docs.forEach((doc: any) => {
                const d = doc.data();
                const name = d.classGrade || d.name;
                if (name && !uniqueClasses.has(name)) {
                  uniqueClasses.set(name, { id: doc.id, name, level: d.level || "General" });
                }
              });
              config.academic.classes = Array.from(uniqueClasses.values());
            } else {
              const sectionsSnap = await db.collection("sections").where("tenantId", "==", tenantId).get();
              if (!sectionsSnap.empty) {
                const uniqueClasses = new Map<string, any>();
                sectionsSnap.docs.forEach((doc: any) => {
                  const d = doc.data();
                  const name = d.classGrade || d.name;
                  if (name && !uniqueClasses.has(name)) {
                    uniqueClasses.set(name, { id: doc.id, name, level: "General" });
                  }
                });
                config.academic.classes = Array.from(uniqueClasses.values());
              }
            }
          }
        } catch {
          // non-fatal
        }
      }

      // Fallback sections
      if (!config.academic.sectionNames || config.academic.sectionNames.length === 0) {
        config.academic.sectionNames = ["A", "B", "C"];
      }

      // Ensure state is published if tenant has data
      if (config.state !== "Published" && (tenantData || (config.academic.classes && config.academic.classes.length > 0))) {
        config.state = "Published";
        if (config.metadata) config.metadata.isConfigured = true;
      }
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
        const db = (this.repo as any).db || adminDb;
        try {
          if (db?.collection) {
            const tSnap = await db.collection("tenants").doc(tenantId).get();
            if (tSnap.exists && (tSnap.data()?.name || tSnap.data()?.schoolName)) {
              const cfg = await this.getConfigurationViewModel(tenantId);
              return {
                status: "CONFIGURED",
                configuration: cfg as any,
                diagnostics: { ...health.diagnostics, configExists: true, isPublished: true, tenantValid: true },
              };
            }
          }
        } catch {
          // ignore error and proceed
        }

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

  async saveAndPublishConfiguration(input: WizardInput, tenantId: string, userId: string, userRole?: string): Promise<MasterSchoolConfiguration> {
    try {
      const health = await this.healthService.checkHealth(tenantId);
      if (!health.diagnostics.tenantValid) {
        const repairResult = await this.tenantService.provisionOrRepairTenant(tenantId, userId);
        if (repairResult.repaired) {
          const recheck = await this.healthService.checkHealth(tenantId);
          if (!recheck.diagnostics.tenantValid) {
            throw new ConfigurationValidationError(`Tenant ${tenantId} does not exist or is invalid. Configuration cannot be published.`);
          }
        } else {
          throw new ConfigurationValidationError(`Tenant ${tenantId} does not exist or is invalid. Configuration cannot be published.`);
        }
      }

      const existing = await this.repo.getConfiguration(tenantId);
      const previousVersion = existing?.version.number || 0;
      const { schoolProfile, academicStructure } = input;

      const isAdmin = userRole === "admin" || userRole === "superAdmin" || userRole === "schoolAdmin" || userRole === "super_admin";
      if (!isAdmin) {
        throw new ConfigurationValidationError("Configuration Write Violation: Only administrators can create or publish school configuration.");
      }

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
        state: "Draft",
        metadata: {
          tenantId: tenantId,
          schemaVersion: 2,
          configurationVersion: previousVersion + 1,
          environment: (process.env.NODE_ENV as any) || "development",
          region: "default",
          timezone: "UTC",
          academicYearId: existing?.metadata.academicYearId || null,
          currentSnapshotId: null,
          isConfigured: false,
          configuredAt: undefined,
          configuredBy: undefined,
          lastModified: nowISO(),
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
          levels: (academicStructure.levels || []).map((l: any) => l.id || l.name || l),
          classes: mappedClasses,
          sectionNames,
          subjects: (academicStructure.allSubjects || []).map((s: any) => s.name || s),
          requiredLabs: academicStructure.requiredLabs || [],
          requiredTeachers: academicStructure.requiredTeachers || {},
          departments: academicStructure.departments || [],
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

      const provisioning = await this.provisioningService.provisionFromConfiguration(tenantId, newConfig, userId);
      if (!provisioning.academicYearId) {
        throw new ConfigurationInvalidError("Configuration provisioning did not produce a current academic year");
      }

      newConfig.metadata.academicYearId = provisioning.academicYearId;
      newConfig.state = "Published";

      await this.repo.publishConfiguration(tenantId, newConfig, userId);
      await this.cache.invalidateConfiguration(tenantId);
      await this.cache.setConfiguration(tenantId, newConfig);

      // 100% Cross-Module Cascading Sync: Tenant Profile, Fee Structures, and Exam Terms
      try {
        const db = (this.repo as any).db || adminDb;
        if (db?.collection) {
          // 1. Sync Tenant Profile metadata
          await db.collection("tenants").doc(tenantId).set({
            name: newConfig.school.name,
            schoolName: newConfig.school.name,
            academicYear: newConfig.metadata.academicYearId,
            academicYearId: newConfig.metadata.academicYearId,
            currency: (input as any).currency || "PKR",
            country: newConfig.school.country || "PK",
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          // 2. Sync Default Fee Structures / Heads
          const feeHeads = (input as any).feeCategories || ["Tuition Fee", "Admission Fee", "Exam Fee"];
          for (const headName of feeHeads) {
            const hName = typeof headName === "string" ? headName : headName?.name;
            if (!hName) continue;
            const existingFees = await db.collection("fee_structures")
              .where("tenantId", "==", tenantId)
              .where("name", "==", hName)
              .get();
            if (existingFees.empty) {
              await db.collection("fee_structures").add({
                name: hName,
                amount: 5000,
                currency: (input as any).currency || "PKR",
                frequency: "monthly",
                tenantId,
                createdAt: new Date().toISOString(),
              });
            }
          }

          // 3. Sync Default Exam Terms
          const examTerms = (input as any).examTerms || ["Mid-Term", "Final Term"];
          for (const term of examTerms) {
            const tName = typeof term === "string" ? term : term?.name;
            if (!tName) continue;
            const existingTerms = await db.collection("exam_terms")
              .where("tenantId", "==", tenantId)
              .where("name", "==", tName)
              .get();
            if (existingTerms.empty) {
              await db.collection("exam_terms").add({
                name: tName,
                academicYearId: newConfig.metadata.academicYearId,
                tenantId,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (cascadeErr) {
        logger.warn("[ConfigurationService] Cross-module sync non-fatal warning", {
          metadata: { tenantId, err: cascadeErr },
        });
      }

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
      throw error;
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

  async getConfiguration(tenantId: string): Promise<MasterSchoolConfiguration | null> {
    return this.repo.getConfiguration(tenantId);
  }

  async saveConfiguration(tenantId: string, config: MasterSchoolConfiguration): Promise<void> {
    return this.repo.saveConfiguration(tenantId, config);
  }

  async checkForUpgrades(tenantId: string): Promise<UpgradeCheckResult> {
    const config = await this.getConfiguration(tenantId);
    if (!config) {
      throw new ConfigurationNotFoundError(tenantId);
    }
    return versionEngine.checkForUpgrades(config);
  }

  async upgradeCurriculum(tenantId: string, newVersionId: string, userId: string): Promise<MasterSchoolConfiguration> {
    const currentConfig = await this.getConfiguration(tenantId);
    if (!currentConfig) {
      throw new ConfigurationNotFoundError(tenantId);
    }

    const upgradePatch = await versionEngine.applyUpgrade(currentConfig, newVersionId);

    const updatedConfig: MasterSchoolConfiguration = {
      ...currentConfig,
      ...upgradePatch,
      version: {
        ...currentConfig.version,
        number: currentConfig.version.number + 1,
        reason: `Upgraded to Curriculum Version: ${newVersionId}`,
        publishedAt: new Date().toISOString(),
        publishedBy: userId,
      },
    };

    await this.saveConfiguration(tenantId, updatedConfig);
    return updatedConfig;
  }
}

export const configurationService = new ConfigurationService();
