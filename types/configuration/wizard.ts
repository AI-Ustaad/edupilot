import { randomUUID } from "crypto";

export interface WizardInput {
  schoolProfile: {
    name: string;
    type: string;
    curriculumId: string;
    boardName?: string;
    country?: string;
    sections?: string[];
  };
  academicStructure: {
    levels: any[];
    grades: any[];
    allSubjects: any[];
    requiredLabs?: any[];
    requiredTeachers?: Record<string, number>;
    departments?: any[];
  };
}

export function createVersion(number: number, userId: string, reason: string): {
  id: string;
  number: number;
  createdBy: string;
  createdAt: string;
  publishedBy?: string;
  publishedAt?: string;
  reason: string;
  checksum: string;
} {
  const now = new Date().toISOString();
  return {
    id: `v_${randomUUID()}`,
    number,
    createdBy: userId,
    createdAt: now,
    publishedBy: userId,
    publishedAt: now,
    reason,
    checksum: `ck_${Date.now()}_${randomUUID().slice(0, 8)}`,
  };
}

export function createDefaultFeatures() {
  return {
    ai: {
      enabled: true,
      version: "1.0",
      permissions: ["admin", "teacher"],
      beta: false,
      providers: ["gemini"] as const,
      activeProvider: "gemini",
      quota: 1000,
    },
    library: {
      enabled: true,
      version: "1.0",
      permissions: ["admin", "teacher"],
      beta: false,
    },
    transport: {
      enabled: false,
      version: "1.0",
      permissions: ["admin"],
      beta: false,
    },
    fees: {
      enabled: true,
      version: "1.0",
      permissions: ["admin", "accountant"],
      beta: false,
    },
    attendance: {
      enabled: true,
      version: "1.0",
      permissions: ["admin", "teacher"],
      beta: false,
    },
    exams: {
      enabled: true,
      version: "1.0",
      permissions: ["admin", "teacher"],
      beta: false,
    },
  };
}

export function buildDefaultConfiguration(tenantId: string, userId: string): import("@/types/configuration").MasterSchoolConfiguration {
  const now = new Date().toISOString();
  return {
    id: "current",
    tenantId,
    state: "Draft",
    metadata: {
      tenantId,
      schemaVersion: 2,
      configurationVersion: 0,
      environment: (process.env.NODE_ENV as "development" | "staging" | "production") || "development",
      region: "default",
      timezone: "UTC",
      academicYearId: null,
      currentSnapshotId: null,
      isConfigured: false,
      lastModified: now,
    },
    version: {
      id: `v_${randomUUID()}`,
      number: 0,
      createdBy: userId,
      createdAt: now,
      reason: "Initial skeleton configuration",
      checksum: `ck_${Date.now()}`,
    },
    school: {
      name: "Untitled School",
      type: "Private",
      curriculumId: "custom",
      boardName: "Custom Board",
      country: "PK",
    },
    academic: {
      levels: [],
      classes: [],
      sectionNames: ["A"],
      subjects: [],
      requiredLabs: [],
      requiredTeachers: {},
    },
    features: createDefaultFeatures() as any,
  };
}
