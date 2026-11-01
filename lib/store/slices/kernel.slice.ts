// lib/store/slices/kernel.slice.ts
import { StateCreator } from "zustand";
import { EnterpriseRuntimeStore, KernelSlice } from "../types";
import type { MasterSchoolConfiguration } from "@/types/configuration";

export const createKernelSlice: StateCreator<EnterpriseRuntimeStore, [], [], KernelSlice> = (set) => ({
  isInitialized: false,
  syncStatus: "idle",
  lastSyncedAt: null,
  currentVersion: 0,
  tenantId: null,
  config: null,

  // Accept MasterSchoolConfiguration OR SchoolConfigurationViewModel
  initializeKernel: (tenantId: string, rawConfig: any) => {
    if (!rawConfig) return;

    // Support both MasterSchoolConfiguration (nested) and SchoolConfigurationViewModel (flattened)
    const schoolName = rawConfig.school?.name || rawConfig.schoolName || "";
    const schoolType = rawConfig.school?.type || rawConfig.schoolType || "Private";
    const curriculumId = rawConfig.school?.curriculumId || rawConfig.boardName || "";
    const country = rawConfig.school?.country || "PK";

    const levels = rawConfig.academic?.levels || rawConfig.levels || [];
    const classes = rawConfig.academic?.classes || rawConfig.classes || [];
    const subjects = rawConfig.academic?.subjects || rawConfig.subjects || [];
    const defaultSections = rawConfig.academic?.sectionNames || rawConfig.sectionNames || ["A"];

    const versionNumber = rawConfig.version?.number || rawConfig.versionNumber || 1;
    const enabledModules = rawConfig.features?.modules || rawConfig.enabledFeatures || ["attendance", "exams", "fees"];

    // Normalized MasterSchoolConfiguration for global access
    const normalizedConfig: any = rawConfig.school && rawConfig.academic ? rawConfig : {
      id: rawConfig.id || `cfg_${tenantId}`,
      tenantId,
      state: rawConfig.state || "Published",
      metadata: {
        id: rawConfig.id || `cfg_${tenantId}`,
        tenantId,
        state: rawConfig.state || "Published",
        version: versionNumber,
        createdAt: rawConfig.publishedAt || new Date().toISOString(),
        updatedAt: rawConfig.publishedAt || new Date().toISOString(),
      },
      school: {
        name: schoolName,
        type: schoolType,
        curriculumId,
        boardName: curriculumId,
        country,
      },
      academic: {
        levels,
        classes,
        subjects,
        sectionNames: defaultSections,
      },
      version: {
        number: versionNumber,
        publishedAt: rawConfig.publishedAt,
      },
      features: {
        modules: enabledModules,
      },
      status: rawConfig.status || "CONFIGURED",
    };

    set((state) => ({
      ...state,
      isInitialized: true,
      syncStatus: "idle",
      lastSyncedAt: new Date().toISOString(),
      currentVersion: versionNumber,
      tenantId: tenantId,
      config: normalizedConfig,

      // Map School Profile
      name: schoolName,
      type: schoolType,
      curriculumId: curriculumId,
      country: country,

      // Map Academic Structure
      levels: levels,
      classes: classes,
      subjects: subjects,
      defaultSections: defaultSections,
      enabledModules: enabledModules,
    }));
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
});
