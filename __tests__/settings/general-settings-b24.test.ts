import { SettingsGeneralService } from "@/services/settings-general.service";
import { SettingsRepository } from "@/repositories/settings.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";
import {
  normalizeCountryCode,
  countryDisplayName,
  COUNTRY_OPTIONS,
} from "@/lib/utils/country";
import type { MasterSchoolConfiguration } from "@/types/configuration";

jest.mock("@/repositories/settings.repository");
jest.mock("@/repositories/configuration.repository");
jest.mock("@/services/configuration-cache.service");

describe("B24 — Country field + Established Year in General Settings", () => {
  describe("country helpers", () => {
    it("normalises codes, full names and legacy aliases to PK by default", () => {
      expect(normalizeCountryCode("PK")).toBe("PK");
      expect(normalizeCountryCode("pk")).toBe("PK");
      expect(normalizeCountryCode("PAK")).toBe("PK");
      expect(normalizeCountryCode("Pakistan")).toBe("PK");
      expect(normalizeCountryCode("pakistan")).toBe("PK");
      expect(normalizeCountryCode(undefined)).toBe("PK");
      expect(normalizeCountryCode("")).toBe("PK");
      expect(normalizeCountryCode(null)).toBe("PK");
      expect(normalizeCountryCode("IN")).toBe("IN");
      expect(normalizeCountryCode("India")).toBe("IN");
    });

    it("displays the full country name, defaulting to Pakistan", () => {
      expect(countryDisplayName("PK")).toBe("Pakistan");
      expect(countryDisplayName("PAK")).toBe("Pakistan");
      expect(countryDisplayName("Pakistan")).toBe("Pakistan");
      expect(countryDisplayName(undefined)).toBe("Pakistan");
      expect(countryDisplayName("IN")).toBe("India");
    });

    it("lists Pakistan first among the country options", () => {
      expect(COUNTRY_OPTIONS[0]).toEqual({ code: "PK", name: "Pakistan" });
    });
  });

  describe("SettingsGeneralService (B24 persistence)", () => {
    let settingsRepo: jest.Mocked<SettingsRepository>;
    let configRepo: jest.Mocked<ConfigurationRepository>;
    let cache: jest.Mocked<ConfigurationCacheService>;
    let service: SettingsGeneralService;

    const tenantId = "tenant_b24_123";

    const mockMaster: Partial<MasterSchoolConfiguration> = {
      school: {
        name: "Government High School Sahiwal",
        type: "Government",
        curriculumId: "pctb",
        boardName: "Punjab Board",
        country: "PK",
      },
      academic: {
        levels: ["Primary"],
        classes: [],
        sectionNames: ["A"],
        subjects: [],
        requiredLabs: [],
        requiredTeachers: {},
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      settingsRepo = new SettingsRepository() as any;
      configRepo = new ConfigurationRepository() as any;
      cache = new ConfigurationCacheService() as any;
      service = new SettingsGeneralService(settingsRepo, configRepo, cache);
    });

    it("GET: returns the master country and the legacy establishedYear", async () => {
      configRepo.getConfiguration.mockResolvedValue(mockMaster as any);
      settingsRepo.getGeneral.mockResolvedValue({
        establishedYear: 2005,
        city: "Sahiwal",
      });

      const result = await service.getGeneral(tenantId);

      expect(result?.country).toBe("PK");
      expect(result?.establishedYear).toBe(2005);
    });

    it("GET: defaults country to PK when neither master nor legacy has one", async () => {
      configRepo.getConfiguration.mockResolvedValue(null);
      settingsRepo.getGeneral.mockResolvedValue(null);

      const result = await service.getGeneral(tenantId);

      expect(result?.country).toBe("PK");
    });

    it("PUT: propagates the edited country to the master config and dual-writes establishedYear to legacy", async () => {
      const master: any = {
        school: {
          name: "Government High School Sahiwal",
          type: "Government",
          curriculumId: "pctb",
          boardName: "Punjab Board",
          country: "PK",
        },
        academic: {
          levels: ["Primary"],
          classes: [],
          sectionNames: ["A"],
          subjects: [],
        },
        metadata: { lastModified: "2026-01-01T00:00:00.000Z" },
      };

      configRepo.getConfiguration.mockResolvedValue(master);
      settingsRepo.updateGeneral.mockResolvedValue(undefined);
      configRepo.saveConfiguration.mockResolvedValue(undefined);
      cache.invalidateConfiguration.mockResolvedValue(undefined);

      await service.updateGeneral(tenantId, {
        country: "IN",
        establishedYear: "1998",
        city: "Sahiwal",
      });

      // 1. Dual-write to legacy settings keeps both new fields
      expect(settingsRepo.updateGeneral).toHaveBeenCalledWith(
        tenantId,
        expect.objectContaining({ country: "IN", establishedYear: "1998" })
      );

      // 2. Master configuration receives the edited country
      expect(configRepo.saveConfiguration).toHaveBeenCalledWith(
        tenantId,
        expect.objectContaining({
          school: expect.objectContaining({ country: "IN" }),
        })
      );

      // 3. Cache invalidated so School Setup sees the new values
      expect(cache.invalidateConfiguration).toHaveBeenCalledWith(tenantId);
    });
  });
});
