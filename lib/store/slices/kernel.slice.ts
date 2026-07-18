// lib/store/slices/kernel.slice.ts
import { StateCreator } from "zustand";
import { EnterpriseRuntimeStore, KernelSlice } from "../types";
// 🟢 FIX: Import the new Enterprise Configuration Model
import type { MasterSchoolConfiguration } from "@/types/configuration";

export const createKernelSlice: StateCreator<EnterpriseRuntimeStore, [], [], KernelSlice> = (set) => ({
  isInitialized: false,
  syncStatus: "idle",
  lastSyncedAt: null,
  currentVersion: 0,
  tenantId: null,
  config: null,

  // 🟢 FIX: Accept MasterSchoolConfiguration
  initializeKernel: (tenantId: string, config: MasterSchoolConfiguration) => {
    set((state) => ({
      ...state,
      isInitialized: true,
      syncStatus: "idle",
      lastSyncedAt: new Date().toISOString(),
      
      // 🟢 FIX: version is now an object, so we extract the number
      currentVersion: config.version?.number || 1,
      tenantId: tenantId,
      config: config, // Save the entire config object
      
      // 🟢 FIX: Map School Profile
      name: config.school?.name || "",
      type: config.school?.type || "Private",
      curriculumId: config.school?.curriculumId || "",
      country: config.school?.country || "PK",
      
      // 🟢 FIX: Map Academic Structure (academic instead of academicStructure)
      levels: config.academic?.levels || [],
      classes: config.academic?.classes || [],
      subjects: config.academic?.subjects || [],
      defaultSections: config.academic?.sectionNames || ["A"],
    }));
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
});
