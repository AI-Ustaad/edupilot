import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";
import { ConfigurationInvalidError } from "@/lib/errors/configuration.errors";
import type { ConfigurationHealthResult } from "@/types/configuration/status";
import type { IConfigurationHealthService } from "@/interfaces/IConfigurationHealthService";

export class ConfigurationHealthService implements IConfigurationHealthService {
  async checkHealth(tenantId: string): Promise<ConfigurationHealthResult> {
    const diagnostics = {
      configExists: false,
      metadataExists: false,
      schoolProfileExists: false,
      academicStructureExists: false,
      isPublished: false,
      versionValid: false,
      tenantValid: false,
      schemaValid: false,
    };

    try {
      const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get();
      diagnostics.tenantValid = tenantDoc.exists;

      if (!diagnostics.tenantValid) {
        return this.buildResult(false, diagnostics, "INVALID");
      }

      const configRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config");
      const configDoc = await configRef.get();

      diagnostics.configExists = configDoc.exists;

      if (!configDoc.exists) {
        return this.buildResult(false, diagnostics, "NOT_CONFIGURED");
      }

      const data = configDoc.data();

      if (!data) {
        return this.buildResult(false, diagnostics, "NOT_CONFIGURED");
      }

      diagnostics.metadataExists = this.hasMetadata(data);
      diagnostics.schoolProfileExists = this.hasSchoolProfile(data);
      diagnostics.academicStructureExists = this.hasAcademicStructure(data);
      diagnostics.isPublished = data.state === "Published" || data.metadata?.isConfigured === true;
      diagnostics.versionValid = this.isVersionValid(data);
      diagnostics.schemaValid = this.isSchemaValid(data);

      const healthy = Object.values(diagnostics).every(Boolean);
      if (!healthy) {
        const missingFields = Object.entries(diagnostics)
          .filter(([key, value]) => !value)
          .map(([key]) => key);

        return {
          ...this.buildResult(false, diagnostics, "PARTIALLY_CONFIGURED"),
          nextAction: `Missing required fields: ${missingFields.join(", ")}`,
        };
      }

      return this.buildResult(true, diagnostics, "CONFIGURED");
    } catch (error) {
      logger.error("CONFIGURATION_HEALTH_CHECK_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return this.buildResult(false, diagnostics, "INVALID");
    }
  }

  private hasMetadata(data: any): boolean {
    return (
      !!data.metadata &&
      typeof data.metadata.tenantId === "string" &&
      typeof data.metadata.configurationVersion === "number" &&
      typeof data.metadata.schemaVersion === "number"
    );
  }

  private hasSchoolProfile(data: any): boolean {
    return (
      !!data.school &&
      typeof data.school.name === "string" &&
      data.school.name.trim() !== "" &&
      typeof data.school.curriculumId === "string"
    );
  }

  private hasAcademicStructure(data: any): boolean {
    return (
      !!data.academic &&
      Array.isArray(data.academic.levels) &&
      Array.isArray(data.academic.classes) &&
      Array.isArray(data.academic.sectionNames) &&
      Array.isArray(data.academic.subjects)
    );
  }

  private isVersionValid(data: any): boolean {
    return !!data.version && typeof data.version.number === "number" && data.version.number > 0;
  }

  private isSchemaValid(data: any): boolean {
    return typeof data.metadata?.schemaVersion === "number" && data.metadata.schemaVersion >= 1;
  }

  private buildResult(
    healthy: boolean,
    diagnostics: ConfigurationHealthResult["diagnostics"],
    status: ConfigurationHealthResult["status"]
  ): ConfigurationHealthResult {
    const result: ConfigurationHealthResult = {
      healthy,
      status,
      diagnostics,
    };

    if (status === "NOT_CONFIGURED") {
      result.nextAction = "Create new configuration via Smart Setup Wizard";
    } else if (status === "PARTIALLY_CONFIGURED") {
      result.nextAction = "Complete the incomplete configuration";
    } else if (status === "INVALID") {
      result.nextAction = "Delete and recreate configuration";
    }

    return result;
  }
}
