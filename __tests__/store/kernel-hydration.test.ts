import { useRuntimeStore } from "@/lib/store/runtime.store";
import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";

describe("Kernel Hydration & ViewModel Mapping (DEF-002)", () => {
  const tenantId = "tenant_test_123";

  beforeEach(() => {
    // Reset store state
    useRuntimeStore.setState({
      isInitialized: false,
      syncStatus: "idle",
      lastSyncedAt: null,
      currentVersion: 0,
      tenantId: null,
      config: null,
      name: "",
      type: "",
      curriculumId: "",
      country: "PK",
      levels: [],
      classes: [],
      subjects: [],
      defaultSections: ["A"],
      enabledModules: ["attendance", "exams", "fees"],
    });
  });

  it("hydrates successfully from nested MasterSchoolConfiguration payload", () => {
    const masterConfig: any = {
      id: "config",
      tenantId,
      state: "Published",
      metadata: {
        tenantId,
        schemaVersion: 2,
        configurationVersion: 3,
        environment: "development",
        region: "default",
        timezone: "UTC",
        academicYearId: "ay_2026",
        currentSnapshotId: null,
        isConfigured: true,
        lastModified: "2026-11-01T00:00:00.000Z",
      },
      version: {
        number: 3,
        id: "v3",
        createdBy: "admin_1",
        createdAt: "2026-11-01T00:00:00.000Z",
        reason: "Update",
        checksum: "abc123checksum",
        publishedAt: "2026-11-01T00:00:00.000Z",
        publishedBy: "admin_1",
      },
      school: {
        name: "Enterprise Grammar School",
        type: "Private",
        curriculumId: "cambridge",
        boardName: "Cambridge International",
        country: "PK",
      },
      academic: {
        levels: ["Primary", "Secondary"],
        classes: [
          { id: "c1", name: "Class 1", level: "Primary", subjects: ["English", "Math"] },
          { id: "c2", name: "Class 2", level: "Primary", subjects: ["English", "Math", "Science"] },
        ],
        sectionNames: ["A", "B"],
        subjects: ["English", "Math", "Science"],
        requiredLabs: ["Computer Lab"],
        requiredTeachers: { English: 2, Math: 2 },
      },
      features: {
        ai: { enabled: true, version: "1.0", permissions: [], beta: false, providers: ["gemini"], activeProvider: "gemini", quota: 1000 },
        library: { enabled: true, version: "1.0", permissions: [], beta: false },
        transport: { enabled: false, version: "1.0", permissions: [], beta: false },
        fees: { enabled: true, version: "1.0", permissions: [], beta: false },
        attendance: { enabled: true, version: "1.0", permissions: [], beta: false },
        exams: { enabled: true, version: "1.0", permissions: [], beta: false },
      },
    };

    useRuntimeStore.getState().initializeKernel(tenantId, masterConfig);

    const state = useRuntimeStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.tenantId).toBe(tenantId);
    expect(state.name).toBe("Enterprise Grammar School");
    expect(state.type).toBe("Private");
    expect(state.curriculumId).toBe("cambridge");
    expect(state.levels).toEqual(["Primary", "Secondary"]);
    expect(state.classes).toHaveLength(2);
    expect(state.subjects).toEqual(["English", "Math", "Science"]);
    expect(state.defaultSections).toEqual(["A", "B"]);
    expect(state.currentVersion).toBe(3);
    expect(state.config).toBeDefined();
  });

  it("hydrates successfully from flattened SchoolConfigurationViewModel payload", () => {
    const viewModel: SchoolConfigurationViewModel = {
      id: "config",
      tenantId,
      isLoading: false,
      hasErrors: false,
      state: "Published",
      stateLabel: "Published",
      schoolName: "Model Public Academy",
      schoolType: "Private",
      boardName: "Federal Board",
      levels: ["Secondary", "Higher Secondary"],
      classes: [
        { id: "c9", name: "Class 9" },
        { id: "c10", name: "Class 10" },
      ],
      classCount: 2,
      classSummary: "2 Classes",
      subjects: ["Physics", "Chemistry", "Biology"],
      subjectCount: 3,
      sectionCount: 2,
      sectionNames: ["Rose", "Tulip"],
      requiredLabs: ["Physics Lab", "Chemistry Lab"],
      requiredTeachers: { Physics: 1, Chemistry: 1 },
      versionNumber: 5,
      versionLabel: "Version 5",
      publishedAt: "2026-11-01T00:00:00.000Z",
      completionLabel: "Completed",
      enabledFeatures: ["attendance", "fees", "exams", "ai"],
    };

    useRuntimeStore.getState().initializeKernel(tenantId, viewModel);

    const state = useRuntimeStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.tenantId).toBe(tenantId);
    expect(state.name).toBe("Model Public Academy");
    expect(state.type).toBe("Private");
    expect(state.curriculumId).toBe("Federal Board");
    expect(state.levels).toEqual(["Secondary", "Higher Secondary"]);
    expect(state.classes).toHaveLength(2);
    expect(state.subjects).toEqual(["Physics", "Chemistry", "Biology"]);
    expect(state.defaultSections).toEqual(["Rose", "Tulip"]);
    expect(state.currentVersion).toBe(5);
    expect(state.config?.school?.name).toBe("Model Public Academy");
    expect(state.config?.academic?.classes).toHaveLength(2);
  });
});
