import { MasterSchoolConfiguration } from "@/types/configuration";
import { StudentSlice } from "./slices/student.slice";
import { AttendanceSlice } from "./slices/attendance.slice";
import { FeesSlice } from "./slices/fees.slice";

export interface KernelSlice {
  isInitialized: boolean;
  syncStatus: "idle" | "syncing" | "error";
  lastSyncedAt: string | null;
  currentVersion: number;
  tenantId: string | null;
  initializeKernel: (tenantId: string, config: MasterSchoolConfiguration) => void;
  setSyncStatus: (status: "idle" | "syncing" | "error") => void;
}

export interface SchoolSlice {
  name: string;
  type: string;
  curriculumId: string;
  logoUrl?: string;
  country: string;
}

export interface AcademicSlice {
  levels: string[];
  classes: Array<{ id: string; name: string; level: string }>;
  subjects: Array<{ name: string; type: string }>;
  defaultSections: string[];
}

export interface FeatureSlice {
  enabledModules: string[];
  isFeatureEnabled: (featureName: string) => boolean;
}

// 🟢 REGISTERED: Student, Attendance, and Fees Slices are now part of the Master Store
export type EnterpriseRuntimeStore = KernelSlice & 
  SchoolSlice & 
  AcademicSlice & 
  FeatureSlice & 
  StudentSlice & 
  AttendanceSlice & 
  FeesSlice;
