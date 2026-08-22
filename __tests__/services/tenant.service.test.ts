import { TenantService } from "@/services/tenant.service";
import { TenantRepository } from "@/repositories/tenant.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";

jest.mock("@/repositories/tenant.repository");
jest.mock("@/repositories/configuration.repository");
jest.mock("@/lib/logger/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe("TenantService.provisionOrRepairTenant", () => {
  let service: TenantService;
  let mockTenantRepo: jest.Mocked<TenantRepository>;
  let mockConfigRepo: jest.Mocked<ConfigurationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTenantRepo = new TenantRepository() as jest.Mocked<TenantRepository>;
    mockConfigRepo = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
    service = new TenantService();
    (service as any).tenantRepo = mockTenantRepo;
    (service as any).configRepo = mockConfigRepo;
  });

  test("should return no-op when tenant document already exists", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(true);

    const result = await service.provisionOrRepairTenant("tenant_123", "user_abc");

    expect(result.repaired).toBe(false);
    expect(result.reason).toBe("tenant_already_exists");
    expect(mockTenantRepo.restoreTenant).not.toHaveBeenCalled();
  });

  test("should repair tenant when user owns it and config is valid", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(true);
    mockConfigRepo.getConfiguration.mockResolvedValue({
      id: "config",
      tenantId: "tenant_123",
      state: "Published",
      school: { name: "Legacy School", type: "Private", curriculumId: "federal", boardName: "FBISE", country: "PK" },
      metadata: { tenantId: "tenant_123", schemaVersion: 2, configurationVersion: 1, academicYearId: null, lastModified: "2026-01-01T00:00:00Z", configuredBy: "original_owner" },
      version: { number: 1, createdAt: "2026-01-01T00:00:00Z", createdBy: "original_owner" },
      academic: { levels: [], classes: [], sectionNames: ["A"], subjects: [] },
      features: {},
    } as any);

    const result = await service.provisionOrRepairTenant("tenant_123", "user_abc");

    expect(result.repaired).toBe(true);
    expect(result.reason).toBe("tenant_restored_from_configuration");
    expect(mockTenantRepo.restoreTenant).toHaveBeenCalledWith("tenant_123", expect.objectContaining({
      name: "Legacy School",
      type: "Private",
      curriculum: "federal",
      ownerId: "original_owner",
      status: "active",
    }));
  });

  test("should preserve original ownership from configuration, not the requesting user", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(true);
    mockConfigRepo.getConfiguration.mockResolvedValue({
      id: "config",
      tenantId: "tenant_123",
      state: "Published",
      school: { name: "Legacy School", type: "Private", curriculumId: "federal", boardName: "FBISE", country: "PK" },
      metadata: { tenantId: "tenant_123", schemaVersion: 2, configurationVersion: 1, academicYearId: null, lastModified: "2026-01-01T00:00:00Z", configuredBy: "configuring_user" },
      version: { number: 1, createdAt: "2026-01-01T00:00:00Z", createdBy: "version_creator" },
      academic: { levels: [], classes: [], sectionNames: ["A"], subjects: [] },
      features: {},
    } as any);

    const result = await service.provisionOrRepairTenant("tenant_123", "requesting_user");

    expect(result.repaired).toBe(true);
    expect(mockTenantRepo.restoreTenant).toHaveBeenCalledWith("tenant_123", expect.objectContaining({
      ownerId: "configuring_user",
    }));
    expect(mockTenantRepo.restoreTenant).not.toHaveBeenCalledWith("tenant_123", expect.objectContaining({
      ownerId: "requesting_user",
    }));
  });

  test("should fall back to version.createdBy when metadata.configuredBy is absent", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(true);
    mockConfigRepo.getConfiguration.mockResolvedValue({
      id: "config",
      tenantId: "tenant_123",
      state: "Published",
      school: { name: "Legacy School", type: "Private", curriculumId: "federal", boardName: "FBISE", country: "PK" },
      metadata: { tenantId: "tenant_123", schemaVersion: 2, configurationVersion: 1, academicYearId: null, lastModified: "2026-01-01T00:00:00Z" },
      version: { number: 1, createdAt: "2026-01-01T00:00:00Z", createdBy: "version_creator" },
      academic: { levels: [], classes: [], sectionNames: ["A"], subjects: [] },
      features: {},
    } as any);

    const result = await service.provisionOrRepairTenant("tenant_123", "requesting_user");

    expect(result.repaired).toBe(true);
    expect(mockTenantRepo.restoreTenant).toHaveBeenCalledWith("tenant_123", expect.objectContaining({
      ownerId: "version_creator",
    }));
  });

  test("should reject repair when user is not associated with tenantId", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(false);

    const result = await service.provisionOrRepairTenant("tenant_123", "user_abc");

    expect(result.repaired).toBe(false);
    expect(result.reason).toBe("user_not_associated");
    expect(mockTenantRepo.restoreTenant).not.toHaveBeenCalled();
  });

  test("should reject repair when settings/config does not exist", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(true);
    mockConfigRepo.getConfiguration.mockResolvedValue(null);

    const result = await service.provisionOrRepairTenant("tenant_123", "user_abc");

    expect(result.repaired).toBe(false);
    expect(result.reason).toBe("config_missing");
    expect(mockTenantRepo.restoreTenant).not.toHaveBeenCalled();
  });

  test("should reject repair when config is malformed (missing school name)", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(true);
    mockConfigRepo.getConfiguration.mockResolvedValue({
      id: "config",
      tenantId: "tenant_123",
      state: "Published",
      school: { name: "", type: "Private", curriculumId: "" },
      metadata: { tenantId: "tenant_123", schemaVersion: 2, configurationVersion: 1 },
      version: { number: 1, createdAt: "2026-01-01T00:00:00Z" },
      academic: { levels: [], classes: [], sectionNames: [], subjects: [] },
      features: {},
    } as any);

    const result = await service.provisionOrRepairTenant("tenant_123", "user_abc");

    expect(result.repaired).toBe(false);
    expect(result.reason).toBe("config_malformed");
    expect(mockTenantRepo.restoreTenant).not.toHaveBeenCalled();
  });

  test("should not manufacture an academic year during repair", async () => {
    mockTenantRepo.verifyTenantExists.mockResolvedValue(false);
    mockTenantRepo.verifyUserTenantAssociation.mockResolvedValue(true);
    mockConfigRepo.getConfiguration.mockResolvedValue({
      id: "config",
      tenantId: "tenant_123",
      state: "Published",
      school: { name: "Test School", type: "Private", curriculumId: "federal" },
      metadata: { tenantId: "tenant_123", schemaVersion: 2, configurationVersion: 1, academicYearId: null, configuredBy: "original_owner" },
      version: { number: 1, createdAt: "2026-01-01T00:00:00Z", createdBy: "original_owner" },
      academic: { levels: [], classes: [], sectionNames: ["A"], subjects: [] },
      features: {},
    } as any);

    await service.provisionOrRepairTenant("tenant_123", "user_abc");

    expect(mockTenantRepo.restoreTenant).toHaveBeenCalledWith(
      "tenant_123",
      expect.objectContaining({ name: "Test School", status: "active", ownerId: "original_owner" })
    );
  });
});
