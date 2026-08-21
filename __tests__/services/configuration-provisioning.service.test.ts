import { ConfigurationProvisioningService } from "@/services/configuration-provisioning.service";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { DepartmentRepository } from "@/repositories/department.repository";

jest.mock("@/repositories/academic-year.repository");
jest.mock("@/repositories/section.repository");
jest.mock("@/repositories/department.repository");

describe("ConfigurationProvisioningService", () => {
  let service: ConfigurationProvisioningService;
  let mockAcademicYearRepo: jest.Mocked<AcademicYearRepository>;
  let mockSectionRepo: jest.Mocked<SectionRepository>;
  let mockDepartmentRepo: jest.Mocked<DepartmentRepository>;
  const tenantId = "test-tenant";
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    mockAcademicYearRepo = new AcademicYearRepository() as jest.Mocked<AcademicYearRepository>;
    mockSectionRepo = new SectionRepository() as jest.Mocked<SectionRepository>;
    mockDepartmentRepo = new DepartmentRepository() as jest.Mocked<DepartmentRepository>;
    service = new ConfigurationProvisioningService(mockAcademicYearRepo, mockSectionRepo, mockDepartmentRepo);
  });

  const baseConfig = (overrides?: Partial<import("@/types/configuration").MasterSchoolConfiguration>): import("@/types/configuration").MasterSchoolConfiguration => ({
    id: "current",
    tenantId,
    state: "Published",
    metadata: {
      tenantId,
      schemaVersion: 2,
      configurationVersion: 1,
      environment: "development",
      region: "default",
      timezone: "UTC",
      academicYearId: null,
      currentSnapshotId: null,
      isConfigured: true,
      configuredAt: new Date().toISOString(),
      configuredBy: userId,
      lastModified: new Date().toISOString(),
    },
    version: {
      id: "v_1",
      number: 1,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      publishedBy: userId,
      publishedAt: new Date().toISOString(),
      reason: "Initial",
      checksum: "ck_123",
    },
    school: {
      name: "Test School",
      type: "Private",
      curriculumId: "federal",
      boardName: "FBISE",
      country: "PK",
    },
    academic: {
      levels: ["Primary"],
      classes: [
        { id: "cls_1", name: "Grade 1", level: "Primary", subjects: ["Math", "English"] },
        { id: "cls_2", name: "Grade 2", level: "Primary", subjects: ["Math", "English"] },
      ],
      sectionNames: ["A", "B"],
      subjects: ["Math", "English"],
      requiredLabs: [],
      requiredTeachers: {},
      departments: ["Computer Science", "Mathematics"],
    },
    features: {
      ai: { enabled: true, version: "1.0", permissions: ["admin"], beta: false, providers: ["gemini"], activeProvider: "gemini", quota: 1000 },
      library: { enabled: true, version: "1.0", permissions: ["admin"], beta: false },
      transport: { enabled: false, version: "1.0", permissions: ["admin"], beta: false },
      fees: { enabled: true, version: "1.0", permissions: ["admin"], beta: false },
      attendance: { enabled: true, version: "1.0", permissions: ["admin"], beta: false },
      exams: { enabled: true, version: "1.0", permissions: ["admin"], beta: false },
    },
    ...overrides,
  });

  describe("provisionFromConfiguration", () => {
    test("should provision academic year, sections, and departments", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([]);
      mockAcademicYearRepo.createIfAbsentByName.mockResolvedValue("ay-new-1");
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(4);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      const result = await service.provisionFromConfiguration(tenantId, baseConfig(), userId);

      expect(result.academicYearId).toBe("ay-new-1");
      expect(result.sectionsCreated).toBe(4);
      expect(result.departmentsCreated).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });

    test("should reuse existing current academic year", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([
        { id: "ay-existing", name: "2024-2025", isCurrent: true, tenantId } as any,
      ]);
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(0);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      const result = await service.provisionFromConfiguration(tenantId, baseConfig(), userId);

      expect(result.academicYearId).toBe("ay-existing");
      expect(mockAcademicYearRepo.createIfAbsentByName).not.toHaveBeenCalled();
    });

    test("should set most recent AY as current if none is current", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([
        { id: "ay-old", name: "2023-2024", isCurrent: false, tenantId, startDate: "2023-04-01" } as any,
      ]);
      mockAcademicYearRepo.setCurrent.mockResolvedValue(undefined);
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(0);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      const result = await service.provisionFromConfiguration(tenantId, baseConfig(), userId);

      expect(result.academicYearId).toBe("ay-old");
      expect(mockAcademicYearRepo.setCurrent).toHaveBeenCalledWith("ay-old", tenantId);
    });

    test("should skip sections when no classes exist", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([]);
      mockAcademicYearRepo.createIfAbsentByName.mockResolvedValue("ay-1");
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(0);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      const config = baseConfig();
      config.academic.classes = [];
      const result = await service.provisionFromConfiguration(tenantId, config, userId);

      expect(result.sectionsCreated).toBe(0);
      expect(mockSectionRepo.createMissingSections).not.toHaveBeenCalled();
    });

    test("should skip departments when none configured", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([]);
      mockAcademicYearRepo.createIfAbsentByName.mockResolvedValue("ay-1");
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(4);
      mockDepartmentRepo.getAll.mockResolvedValue([]);

      const config = baseConfig();
      config.academic.departments = [];
      const result = await service.provisionFromConfiguration(tenantId, config, userId);

      expect(result.departmentsCreated).toBe(0);
      expect(mockDepartmentRepo.createAbsentByName).not.toHaveBeenCalled();
    });

    test("should skip departments when config has no departments field", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([]);
      mockAcademicYearRepo.createIfAbsentByName.mockResolvedValue("ay-1");
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(4);
      mockDepartmentRepo.getAll.mockResolvedValue([]);

      const config = baseConfig();
      delete (config.academic as any).departments;
      const result = await service.provisionFromConfiguration(tenantId, config, userId);

      expect(result.departmentsCreated).toBe(0);
      expect(mockDepartmentRepo.createAbsentByName).not.toHaveBeenCalled();
    });

    test("fails provisioning rather than returning a false successful configuration", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([]);
      mockAcademicYearRepo.createIfAbsentByName.mockRejectedValue(new Error("AY failed"));
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(4);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      await expect(service.provisionFromConfiguration(tenantId, baseConfig(), userId)).rejects.toThrow("AY failed");
      expect(mockSectionRepo.createMissingSections).not.toHaveBeenCalled();
    });
  });

  describe("academicYearId handoff contract", () => {
    test("provisioning returns academicYearId as the sole handoff seam for Phase 3", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([
        { id: "ay-current", name: "2024-2025", isCurrent: true, tenantId } as any,
      ]);
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(0);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      const config = baseConfig();
      const result = await service.provisionFromConfiguration(tenantId, config, userId);

      expect(result.academicYearId).toBe("ay-current");
      expect(result.academicYearId).not.toBeNull();
    });

    test("service does NOT persist academicYearId into config.metadata (Phase 3 responsibility)", async () => {
      mockAcademicYearRepo.findAllByTenant.mockResolvedValue([]);
      mockAcademicYearRepo.createIfAbsentByName.mockResolvedValue("ay-new-1");
      mockSectionRepo.findAllActive.mockResolvedValue([]);
      mockSectionRepo.createMissingSections.mockResolvedValue(0);
      mockDepartmentRepo.getAll.mockResolvedValue([]);
      mockDepartmentRepo.createAbsentByName.mockResolvedValue({ id: "dept-1", created: true });

      const config = baseConfig();
      const result = await service.provisionFromConfiguration(tenantId, config, userId);

      expect(result.academicYearId).toBe("ay-new-1");
      expect(config.metadata.academicYearId).toBeNull();
    });
  });
});
