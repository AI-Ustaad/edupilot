import { SettingsGeneralService } from "@/services/settings-general.service";
import { SettingsRepository } from "@/repositories/settings.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";
import type { MasterSchoolConfiguration } from "@/types/configuration";

jest.mock("@/repositories/settings.repository");
jest.mock("@/repositories/configuration.repository");
jest.mock("@/services/configuration-cache.service");

describe("Settings General Unification with MasterSchoolConfiguration (DEF-003)", () => {
  let settingsRepo: jest.Mocked<SettingsRepository>;
  let configRepo: jest.Mocked<ConfigurationRepository>;
  let cache: jest.Mocked<ConfigurationCacheService>;
  let service: SettingsGeneralService;

  const tenantId = "tenant_unification_123";

  beforeEach(() => {
    jest.clearAllMocks();
    settingsRepo = new SettingsRepository() as any;
    configRepo = new ConfigurationRepository() as any;
    cache = new ConfigurationCacheService() as any;
    service = new SettingsGeneralService(settingsRepo, configRepo, cache);
  });

  it("GET: merges MasterSchoolConfiguration with legacy settings", async () => {
    const mockMaster: Partial<MasterSchoolConfiguration> = {
      school: {
        name: "Master School Name",
        type: "Private",
        curriculumId: "cambridge",
        boardName: "Cambridge Board",
        country: "PK",
      },
      academic: {
        levels: ["Primary"],
        classes: [{ id: "c1", name: "Class 1", level: "Primary", subjects: ["Math"] }],
        sectionNames: ["A"],
        subjects: ["Math"],
        requiredLabs: [],
        requiredTeachers: {},
      },
    };

    const mockLegacy = {
      establishedYear: 2005,
      city: "Lahore",
      currency: "PKR",
    };

    configRepo.getConfiguration.mockResolvedValue(mockMaster as any);
    settingsRepo.getGeneral.mockResolvedValue(mockLegacy);

    const result = await service.getGeneral(tenantId);

    expect(result).toBeDefined();
    expect(result?.schoolName).toBe("Master School Name");
    expect(result?.affiliation).toBe("Cambridge Board");
    expect(result?.city).toBe("Lahore");
    expect(result?.establishedYear).toBe(2005);
    expect(result?.classes).toHaveLength(1);
  });

  it("GET: falls back to legacy settings when no master configuration exists", async () => {
    configRepo.getConfiguration.mockResolvedValue(null);
    settingsRepo.getGeneral.mockResolvedValue({
      schoolName: "Legacy Only School",
      city: "Islamabad",
    });

    const result = await service.getGeneral(tenantId);
    expect(result?.schoolName).toBe("Legacy Only School");
    expect(result?.city).toBe("Islamabad");
  });

  it("PUT: dual-writes to legacy settings AND updates MasterSchoolConfiguration", async () => {
    const mockMaster: any = {
      school: {
        name: "Old Name",
        type: "Private",
        curriculumId: "fbise",
        boardName: "Old Board",
        country: "PK",
      },
      academic: {
        levels: ["Primary"],
        classes: [],
        sectionNames: ["A"],
        subjects: [],
      },
      metadata: {
        lastModified: "2026-01-01T00:00:00.000Z",
      },
    };

    configRepo.getConfiguration.mockResolvedValue(mockMaster);
    settingsRepo.updateGeneral.mockResolvedValue(undefined);
    configRepo.saveConfiguration.mockResolvedValue(undefined);
    cache.invalidateConfiguration.mockResolvedValue(undefined);

    await service.updateGeneral(tenantId, {
      schoolName: "Updated New Name",
      affiliation: "New Federal Board",
      city: "Karachi",
    });

    // 1. Assert dual-write to legacy settings
    expect(settingsRepo.updateGeneral).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({ schoolName: "Updated New Name", affiliation: "New Federal Board" })
    );

    // 2. Assert propagation to MasterSchoolConfiguration
    expect(configRepo.saveConfiguration).toHaveBeenCalledWith(
      tenantId,
      expect.objectContaining({
        school: expect.objectContaining({
          name: "Updated New Name",
          boardName: "New Federal Board",
        }),
      })
    );

    // 3. Assert cache invalidation
    expect(cache.invalidateConfiguration).toHaveBeenCalledWith(tenantId);
  });
});

