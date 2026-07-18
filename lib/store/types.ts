// 🟢 FIX 1: Import the new Unified School Configuration
import { SchoolConfiguration } from "@/types/school-configuration";
import { StudentSlice } from "./slices/student.slice";
import { AttendanceSlice } from "./slices/attendance.slice";
import { FeesSlice } from "./slices/fees.slice";

export interface KernelSlice {
  isInitialized: boolean;
  syncStatus: "idle" | "syncing" | "error";
  lastSyncedAt: string | null;
  currentVersion: number;
  tenantId: string | null;
  // 🟢 FIX 2: Updated to use SchoolConfiguration
  initializeKernel: (tenantId: string, config: SchoolConfiguration) => void;
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
  // 🟢 FIX 3: Generalized classes to avoid strict type mismatch with backend
  classes: any[]; 
  // 🟢 FIX 4: Subjects are now an array of strings in the new Architecture
  subjects: string[];
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
