// education/engines/version.engine.ts
import { educationRulesEngine } from "./education-rules.engine";
import { MasterSchoolConfiguration } from "@/types/configuration";

export interface UpgradeCheckResult {
  hasUpdate: boolean;
  latestVersionId?: string;
  latestVersionName?: string;
  changesSummary?: string;
}

export class VersionEngine {
  
  /**
   * Checks if a newer curriculum version is available in the master catalog
   * compared to what the school is currently using.
   */
  async checkForUpgrades(currentConfig: MasterSchoolConfiguration): Promise<UpgradeCheckResult> {
    if (!currentConfig) return { hasUpdate: false };

    const { school, academic } = currentConfig;
    
    // 1. Find all versions available for the school's current system
    // We need to traverse the catalog to find the system.
    // For simplicity, we assume curriculumId maps to systemId in our rules engine.
    const systems = educationRulesEngine.getSystems(school.curriculumId); 
    if (!systems.length) return { hasUpdate: false };

    const latestVersion = systems[0].versions[systems[0].versions.length - 1];
    const currentVersionYear = currentConfig.version?.createdAt?.toString().split("-")[0] || "2024"; // mock extraction

    // 2. Compare current config version with latest version
    // In a real app, we'd store currentVersionId in metadata.
    // Let's mock that currentVersionId is stored in metadata.currentSnapshotId
    const currentVersionId = currentConfig.metadata?.currentSnapshotId || "snc_2024";

    if (latestVersion.id !== currentVersionId) {
      // There is an update!
      return {
        hasUpdate: true,
        latestVersionId: latestVersion.id,
        latestVersionName: latestVersion.name,
        changesSummary: "New subjects and grade rules have been updated by the authority."
      };
    }

    return { hasUpdate: false };
  }

  /**
   * Upgrades the school configuration to the new curriculum version
   * while preserving their selected levels.
   */
  async applyUpgrade(
    currentConfig: MasterSchoolConfiguration, 
    newVersionId: string
  ): Promise<Partial<MasterSchoolConfiguration>> {
    
    // 1. Get the levels the school is currently offering
    const currentLevelIds = currentConfig.academic.levels;

    // 2. Ask Rules Engine to generate new structure for the new version
    const newStructure = educationRulesEngine.generateAcademicStructure(newVersionId, currentLevelIds);

    // 3. Prepare the patch for the configuration repository
    return {
      academic: {
        levels: newStructure.levels.map(l => l.id),
        classes: newStructure.grades.map(g => ({
          id: g.id,
          name: g.name,
          level: g.levelId || g.level,
          subjects: g.schemeOfStudy.subjects.map(s => s.subjectId) // Updated subjects!
        })),
        subjects: newStructure.allSubjects.map(s => s.name),
        requiredLabs: newStructure.requiredLabs,
        requiredTeachers: newStructure.requiredTeachers,
        sectionNames: currentConfig.academic.sectionNames // Preserve old sections
      },
      metadata: {
        ...currentConfig.metadata,
        currentSnapshotId: newVersionId, // Update the version marker
        configurationVersion: currentConfig.metadata.configurationVersion + 1
      }
    };
  }
}

export const versionEngine = new VersionEngine();
