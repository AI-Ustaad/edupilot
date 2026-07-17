import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EnterpriseRuntimeStore } from "./types";
import { createKernelSlice } from "./slices/kernel.slice";
// 🟢 NEW: Import the Student Slice creator
import { createStudentSlice } from "./slices/student.slice";

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
      ...createKernelSlice(...a),
      ...createSchoolSlice(...a),
      ...createAcademicSlice(...a),
      ...createFeatureSlice(...a),
      ...createStudentSlice(...a), // 🟢 FIXED: Registered Student Slice here
    }),
    { name: "EduPilot-Runtime-Kernel" }
  )
);
