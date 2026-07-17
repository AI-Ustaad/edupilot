import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EnterpriseRuntimeStore } from "./types";

// 🟢 Core Slices
import { createKernelSlice } from "./slices/kernel.slice";
import { createStudentSlice } from "./slices/student.slice";

// 🟢 Relational Domain Slices
import { createAttendanceSlice } from "./slices/attendance.slice";
import { createFeesSlice } from "./slices/fees.slice";

const createSchoolSlice = (set: any, get: any, api: any) => ({
  name: "", 
  type: "", 
  curriculumId: "", 
  country: "PK"
});

const createAcademicSlice = (set: any, get: any, api: any) => ({
  levels: [], 
  classes: [], 
  subjects: [], 
  defaultSections: ["A"]
});

const createFeatureSlice = (set: any, get: any, api: any) => ({
  enabledModules: ["attendance", "exams", "fees"], 
  isFeatureEnabled: (featureName: string) => get().enabledModules.includes(featureName),
});

// 🚀 THE RUNTIME STORE
export const useRuntimeStore = create<EnterpriseRuntimeStore>()(
  devtools(
    (...a) => ({
      // 1. Kernel & Configurations
      ...createKernelSlice(...a),
      ...createSchoolSlice(...a),
      ...createAcademicSlice(...a),
      ...createFeatureSlice(...a),
      
      // 2. Enterprise Domains
      ...createStudentSlice(...a),
      ...createAttendanceSlice(...a),
      ...createFeesSlice(...a),
    }),
    { name: "EduPilot-Runtime-Kernel" }
  )
);
