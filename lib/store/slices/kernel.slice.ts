import { StateCreator } from "zustand";
import { EnterpriseRuntimeStore, KernelSlice } from "../types";
// 🟢 FIX 1: Import the correct Unified Configuration Model
import type { SchoolConfiguration } from "@/types/school-configuration";

export const createKernelSlice: StateCreator<EnterpriseRuntimeStore, [], [], KernelSlice> = (set) => ({
  isInitialized: false,
  syncStatus: "idle",
  lastSyncedAt: null,
  currentVersion: 0,
  tenantId: null,

  // 🟢 FIX 2: Updated Signature to use SchoolConfiguration
  initializeKernel: (tenantId: string, config: SchoolConfiguration) => {
    set((state) => ({
      ...state,
      isInitialized: true,
      syncStatus: "idle",
      lastSyncedAt: new Date().toISOString(),
      
      // 🟢 FIX 3: Corrected version mapping (number instead of object)
      currentVersion: config.version,
      tenantId: tenantId,
      
      name: config.school.name,
      type: config.school.type,
      curriculumId: config.school.curriculumId,
      
      // 🟢 FIX 4: Replaced 'academic' with 'academicStructure' and matched correct keys
      levels: config.academicStructure.levels,
      classes: config.academicStructure.classes,
      subjects: config.academicStructure.subjects,
      defaultSections: config.academicStructure.sectionNames,
    }));
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
});
