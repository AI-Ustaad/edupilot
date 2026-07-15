import { StateCreator } from "zustand";
import { EnterpriseRuntimeStore, KernelSlice } from "../types";
import { MasterSchoolConfiguration } from "@/types/configuration";

export const createKernelSlice: StateCreator<EnterpriseRuntimeStore, [], [], KernelSlice> = (set) => ({
  isInitialized: false,
  syncStatus: "idle",
  lastSyncedAt: null,
  currentVersion: 0,
  tenantId: null,

  initializeKernel: (tenantId: string, config: MasterSchoolConfiguration) => {
    set((state) => ({
      ...state,
      isInitialized: true,
      syncStatus: "idle",
      lastSyncedAt: new Date().toISOString(),
      currentVersion: config.version.number,
      tenantId: tenantId,
      // Injecting configuration into other slices automatically
      name: config.school.name,
      type: config.school.type,
      curriculumId: config.school.curriculumId,
      levels: config.academic.levels,
      classes: config.academic.classes,
      subjects: config.academic.subjects,
      defaultSections: config.academic.defaultSections,
    }));
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
});
