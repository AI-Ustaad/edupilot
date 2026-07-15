import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { EnterpriseRuntimeStore } from "./types";
import { createKernelSlice } from "./slices/kernel.slice";

// ہم مزید slices یہاں امپورٹ کریں گے (جیسے Academic, School, Features)
const createSchoolSlice = (set: any) => ({
  name: "", type: "", curriculumId: "", country: "PK"
});

const createAcademicSlice = (set: any) => ({
  levels: [], classes: [], subjects: [], defaultSections: ["A"]
});

const createFeatureSlice = (get: any) => ({
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
