import { MasterSchoolConfiguration } from "@/types/configuration";

// Kernel State (Phase 1)
export interface KernelSlice {
  isInitialized: boolean;
  syncStatus: "idle" | "syncing" | "error";
  lastSyncedAt: string | null;
  currentVersion: number;
  tenantId: string | null;
  initializeKernel: (tenantId: string, config: MasterSchoolConfiguration) => void;
  setSyncStatus: (status: "idle" | "syncing" | "error") => void;
}

// School Domain State
export interface SchoolSlice {
  name: string;
  type: string;
  curriculumId: string;
  logoUrl?: string;
  country: string;
}

// Academic Domain State
export interface AcademicSlice {
  levels: string[];
  classes: Array<{ id: string; name: string; level: string }>;
  subjects: Array<{ name: string; type: string }>;
  defaultSections: string[];
}

// Feature Registry State
export interface FeatureSlice {
  enabledModules: string[];
  isFeatureEnabled: (featureName: string) => boolean;
}

// The Master Store Interface
export type EnterpriseRuntimeStore = KernelSlice & SchoolSlice & AcademicSlice & FeatureSlice;
