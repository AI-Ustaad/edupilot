import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EnterpriseRuntimeStore } from "./types";
import { createKernelSlice } from "./slices/kernel.slice";

// ✅ FIXED: Added get and api arguments to satisfy TypeScript
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
  enabledModules: ["attendance", "exams", "fees"], // یہ بعد میں API سے آئیں گے
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
    }),
    { name: "EduPilot-Runtime-Kernel" }
  )
);
