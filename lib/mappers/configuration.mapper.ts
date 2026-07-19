// lib/mappers/configuration.mapper.ts

import { LegacySchoolConfiguration } from "@/types/school-configuration";
import { MasterSchoolConfiguration, ConfigurationState, ConfigurationVersion, ConfigurationMetadata, AcademicStructure, FeatureRegistry } from "@/types/configuration";

/**
 * Maps raw Firestore data (which might be legacy) to the MasterSchoolConfiguration (SSOT).
 * This is the ONLY place where mapping logic resides (Rule 19).
 */
export function mapToMasterConfiguration(
  rawDoc: any, 
  tenantId: string
): MasterSchoolConfiguration {
  
  // 1. Check if the document is ALREADY in the new Master format
  const isMasterFormat = rawDoc?.state && rawDoc?.metadata && rawDoc?.academic;

  if (isMasterFormat) {
    return rawDoc as MasterSchoolConfiguration;
  }

  // 2. Otherwise, treat it as a Legacy Configuration and map it
  const legacy = rawDoc as LegacySchoolConfiguration;
  
  const defaultFeatures: FeatureRegistry = {
    ai: {
      enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false,
      providers: ["gemini"], activeProvider: "gemini", quota: 1000
    },
    library: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
    transport: { enabled: false, version: "1.0", permissions: ["admin"], beta: false },
    fees: { enabled: true, version: "1.0", permissions: ["admin", "accountant"], beta: false },
    attendance: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
    exams: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
  };

  // 3. Map the simple number version to the Version Object
  const versionNumber = legacy.version || 1;
  const version: ConfigurationVersion = {
    id: `v_${versionNumber}`,
    number: versionNumber,
    createdBy: legacy.completedBy || 'system_migration',
    createdAt: legacy.createdAt?.toString() || new Date().toISOString(),
    publishedBy: legacy.completedBy,
    publishedAt: legacy.completedAt,
    reason: legacy.completedAt ? 'Migrated from Legacy v1' : 'Initial Migration',
    checksum: `checksum_${versionNumber}`,
  };

  // 4. Map Metadata
  const metadata: ConfigurationMetadata = {
    tenantId: tenantId,
    schemaVersion: 2, // Upgrading to new schema
    configurationVersion: versionNumber,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    region: 'default',
    timezone: 'UTC',
    academicYearId: legacy.currentAcademicYearId || null,
    currentSnapshotId: null,
  };

  // 5. Map Academic Structure (ConfiguredClass -> AcademicClass)
  const academic: AcademicStructure = {
    levels: legacy.academicStructure?.levels || [],
    classes: legacy.academicStructure?.classes?.map((c, index) => ({
      id: `cls_${index}_${c.name}`,
      name: c.name,
      level: c.level,
      // Extract subject names from ConfiguredSubject objects
      subjects: c.subjects?.map(s => typeof s === 'string' ? s : s.name) || []
    })) || [],
    sectionNames: legacy.academicStructure?.sectionNames || ['A'],
    subjects: legacy.academicStructure?.subjects || [],
    
    // 🚀 FIX: Provide default empty values for new Intelligence Engine properties
    requiredLabs: [],
    requiredTeachers: {},
  };

  // 6. Determine State based on legacy status
  let state: ConfigurationState = "Draft";
  if (legacy.status === 'configured') {
    state = "Published"; // Auto-publish legacy configured states
  }

  return {
    id: `config_${tenantId}`,
    tenantId: tenantId,
    state: state,
    metadata,
    version,
    school: {
      name: legacy.school?.name || 'Unknown School',
      type: legacy.school?.type || 'Private',
      curriculumId: legacy.school?.curriculumId || 'federal',
      boardName: legacy.school?.boardName || 'Federal Board',
      country: legacy.school?.country || 'PK',
    },
    academic,
    features: defaultFeatures,
  };
}

/**
 * Maps MasterSchoolConfiguration back to a format suitable for Firestore save.
 */
export function mapToDbDocument(config: MasterSchoolConfiguration): any {
  return {
    id: config.id,
    tenantId: config.tenantId,
    state: config.state,
    metadata: config.metadata,
    version: config.version,
    school: config.school,
    academic: config.academic,
    features: config.features,
    // Keep a compatibility status field for legacy systems reading this DB
    status: config.state === "Published" ? "configured" : "draft", 
    schemaVersion: 2, 
    updatedAt: new Date().toISOString()
  };
}
