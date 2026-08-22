import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationService } from "@/services/configuration.service";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";
import { ConfigurationHealthService } from "@/services/configuration-health.service";

interface MockConfig {
  id: string;
  tenantId: string;
  state: "Published";
  metadata: {
    tenantId: string;
    configurationVersion: number;
    schemaVersion: number;
    environment: string;
    region: string;
    timezone: string;
    isConfigured: boolean;
    configuredAt: string;
    configuredBy: string;
    lastModified: string;
  };
  version: {
    id: string;
    number: number;
    createdBy: string;
    createdAt: string;
    publishedBy?: string;
    publishedAt?: string;
    reason: string;
    checksum: string;
  };
  school: {
    name: string;
    type: string;
    curriculumId: string;
    boardName: string;
    country: string;
  };
  academic: {
    levels: string[];
    classes: any[];
    sectionNames: string[];
    subjects: string[];
    requiredLabs: string[];
    requiredTeachers: Record<string, number>;
  };
  features: any;
}

jest.mock('@/lib/mappers', () => ({
  mapConfigurationToViewModel: jest.fn((config: any) => {
    if (!config) return null;
    return {
      id: config.id || 'current_config',
      isLoading: false,
      hasErrors: false,
      state: config.state || 'Published',
      stateLabel: (config.state || 'Published').charAt(0).toUpperCase() + (config.state || 'Published').slice(1),
      schoolName: config.school?.name || 'N/A',
      schoolType: config.school?.type || 'N/A',
      boardName: config.school?.boardName || 'N/A',
      levels: config.academic?.levels || [],
      classes: config.academic?.classes?.map((c: any) => ({ id: c.id, name: c.name })) || [],
      classCount: config.academic?.classes?.length || 0,
      classSummary: `${config.academic?.classes?.length || 0} Classes`,
      subjectCount: config.academic?.subjects?.length || 0,
      sectionCount: config.academic?.sectionNames?.length || 0,
      sectionNames: config.academic?.sectionNames || [],
      requiredLabs: config.academic?.requiredLabs || [],
      requiredTeachers: config.academic?.requiredTeachers || {},
      versionNumber: config.version?.number || 1,
      versionLabel: `Version ${config.version?.number || 1}`,
      publishedAt: config.version?.publishedAt,
      completionLabel: config.metadata?.configuredAt
        ? `Completed ${new Date(config.metadata.configuredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
        : 'Not configured',
      enabledFeatures: Object.keys(config.features || {}).filter((key: string) => config.features?.[key]?.enabled),
    };
  }),
  mapHistory: jest.fn((items: any[]) => {
    return items.map((item: any, index: number) => ({
      id: item.id || `hist_${index}`,
      isLoading: false,
      hasErrors: false,
      versionNumber: item.version?.number || index + 1,
      versionLabel: `Version ${item.version?.number || index + 1}`,
      reason: item.version?.reason || 'Configuration Updated',
      createdBy: item.version?.createdBy || 'System',
      createdAt: item.version?.createdAt || new Date().toISOString(),
      formattedDate: new Date(item.version?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }));
  }),
}));

const mockConfigData = (tenantId: string): MockConfig => ({
  id: 'config',
  tenantId,
  state: 'Published',
  metadata: {
    tenantId,
    configurationVersion: 1,
    schemaVersion: 2,
    environment: 'development',
    region: 'default',
    timezone: 'UTC',
    isConfigured: true,
    configuredAt: new Date().toISOString(),
    configuredBy: 'user1',
    lastModified: new Date().toISOString(),
  },
  version: {
    number: 1,
    id: 'v_1',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    publishedBy: 'user1',
    publishedAt: new Date().toISOString(),
    reason: 'Initial',
    checksum: 'ck_123',
  },
  school: {
    name: 'Test School',
    type: 'Private',
    curriculumId: 'federal',
    boardName: 'FBISE',
    country: 'PK',
  },
  academic: {
    levels: ['Primary', 'Secondary'],
    classes: [
      { id: 'cls_1', name: 'Grade 1', level: 'Primary', subjects: ['Math', 'English'] }
    ],
    sectionNames: ['A', 'B'],
    subjects: ['Math', 'English', 'Science'],
    requiredLabs: ['Physics Lab'],
    requiredTeachers: { English: 2 },
  },
  features: {
    ai: { enabled: true, version: '1.0', permissions: ['admin'], beta: false, providers: ['gemini'], activeProvider: 'gemini', quota: 1000 },
    library: { enabled: true, version: '1.0', permissions: ['admin'], beta: false },
    transport: { enabled: false, version: '1.0', permissions: ['admin'], beta: false },
    fees: { enabled: true, version: '1.0', permissions: ['admin'], beta: false },
    attendance: { enabled: true, version: '1.0', permissions: ['admin'], beta: false },
    exams: { enabled: true, version: '1.0', permissions: ['admin'], beta: false },
  },
});

jest.mock('@/services/configuration-cache.service');
jest.mock('@/services/configuration-health.service');
jest.mock('@/repositories/configuration.repository');
jest.mock('@/services/tenant.service');

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let mockCache: any;
  let mockHealthService: any;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    mockCache = {
      getConfiguration: jest.fn(),
      setConfiguration: jest.fn(),
      invalidateConfiguration: jest.fn(),
      invalidateByTag: jest.fn(),
      getStats: jest.fn(),
    };
    mockHealthService = { checkHealth: jest.fn() };
    service = new ConfigurationService(new ConfigurationRepository() as any, mockCache, mockHealthService);
  });

  describe('getConfigurationViewModel', () => {
    test('should return configuration when cached', async () => {
      const viewModel = {
        id: 'config',
        schoolName: 'Test School',
      } as any;
      mockCache.getConfiguration.mockResolvedValue(viewModel);

      const result = await service.getConfigurationViewModel(tenantId);

      expect(result).not.toBeNull();
      expect(result!.schoolName).toBe('Test School');
    });

    test('should return null when configuration does not exist', async () => {
      mockCache.getConfiguration.mockResolvedValue(null);
    });
  });

  describe('getConfigurationHistoryViewModel', () => {
    test('should return history viewmodels', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.getConfigurationHistory = jest.fn().mockResolvedValue([mockConfigData(tenantId)]);
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService);

      const result = await svc.getConfigurationHistoryViewModel(tenantId);

      expect(result).toHaveLength(1);
    });
  });

  describe('saveAndPublishConfiguration', () => {
    test('should validate payload before saving', async () => {
      const input = {
        schoolProfile: { name: 'Test', type: 'Private', curriculumId: 'c1', sections: [] as string[] },
        academicStructure: { grades: [] as any[], allSubjects: [] as any[] },
      } as any;

      await expect(service.saveAndPublishConfiguration(input, tenantId, 'user1')).rejects.toThrow();
    });

    test('should build config in memory, provision, then publish on success', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockImplementation((_tenantId: string, config: any) => {
        config.state = 'Published';
        config.metadata.isConfigured = true;
        config.metadata.configuredAt = new Date().toISOString();
        config.metadata.configuredBy = 'user1';
        config.metadata.publishedAt = new Date().toISOString();
        config.version.publishedBy = 'user1';
        config.version.publishedAt = new Date().toISOString();
        config.metadata.lastModified = new Date().toISOString();
        return config;
      });
      repoMock.getConfiguration = jest.fn().mockResolvedValue(null);
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      mockHealthService.checkHealth.mockResolvedValue({
        healthy: true,
        status: 'NOT_CONFIGURED',
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: true,
          schemaValid: false,
        },
      });
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: 'academic-year-1',
          sectionsCreated: 2,
          departmentsCreated: 1,
          warnings: [],
        }),
      };
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning);

      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
          requiredLabs: [] as any[],
          requiredTeachers: {} as Record<string, number>,
        },
      };

      const result = await svc.saveAndPublishConfiguration(input, tenantId, 'user1');

      expect(result.state).toBe('Published');
      expect(result.metadata.academicYearId).toBe('academic-year-1');
      expect(provisioning.provisionFromConfiguration).toHaveBeenCalledTimes(1);
      expect(repoMock.publishConfiguration).toHaveBeenCalledTimes(1);

      const publishOrder = (repoMock.publishConfiguration as jest.MockedFunction<any>).mock.invocationCallOrder[0];
      const provisionOrder = (provisioning.provisionFromConfiguration as jest.MockedFunction<any>).mock.invocationCallOrder[0];
      expect(provisionOrder).toBeLessThan(publishOrder);

      expect(repoMock.saveConfiguration).not.toHaveBeenCalled();
      expect(mockCache.invalidateConfiguration).toHaveBeenCalledWith(tenantId);
      expect(mockCache.setConfiguration).toHaveBeenCalledWith(tenantId, expect.objectContaining({
        state: 'Published',
        metadata: expect.objectContaining({ academicYearId: 'academic-year-1' }),
      }));
    });

    test('does not persist configuration when provisioning fails', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockResolvedValue(undefined as any);
      repoMock.getConfiguration = jest.fn().mockResolvedValue(null);
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      mockHealthService.checkHealth.mockResolvedValue({
        healthy: true,
        status: 'NOT_CONFIGURED',
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: true,
          schemaValid: false,
        },
      });
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockRejectedValue(new Error('section write failed')),
      };
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning);
      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
        },
      };

      await expect(svc.saveAndPublishConfiguration(input, tenantId, 'user1')).rejects.toThrow('section write failed');
      expect(repoMock.saveConfiguration).not.toHaveBeenCalled();
      expect(repoMock.publishConfiguration).not.toHaveBeenCalled();
      expect(mockCache.invalidateConfiguration).not.toHaveBeenCalled();
      expect(mockCache.setConfiguration).not.toHaveBeenCalled();
    });

    test('provisions before publishing (ordering)', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockImplementation((_tenantId: string, config: any) => {
        config.state = 'Published';
        config.metadata.isConfigured = true;
        config.metadata.configuredAt = new Date().toISOString();
        config.metadata.configuredBy = 'user1';
        config.metadata.publishedAt = new Date().toISOString();
        config.version.publishedBy = 'user1';
        config.version.publishedAt = new Date().toISOString();
        config.metadata.lastModified = new Date().toISOString();
        return config;
      });
      repoMock.getConfiguration = jest.fn().mockResolvedValue(null);
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      mockHealthService.checkHealth.mockResolvedValue({
        healthy: true,
        status: 'NOT_CONFIGURED',
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: true,
          schemaValid: false,
        },
      });
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: 'ay-ordering',
          sectionsCreated: 0,
          departmentsCreated: 0,
          warnings: [],
        }),
      };
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning);

      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
          requiredLabs: [] as any[],
          requiredTeachers: {} as Record<string, number>,
        },
      };

      await svc.saveAndPublishConfiguration(input, tenantId, 'user1');

      const publishOrder = (repoMock.publishConfiguration as jest.MockedFunction<any>).mock.invocationCallOrder[0];
      const provisionOrder = (provisioning.provisionFromConfiguration as jest.MockedFunction<any>).mock.invocationCallOrder[0];

      expect(provisionOrder).toBeLessThan(publishOrder);
    });

    test('should not publish when tenant does not exist', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockResolvedValue(undefined as any);
      repoMock.getConfiguration = jest.fn().mockResolvedValue(null);
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: 'ay-1',
          sectionsCreated: 0,
          departmentsCreated: 0,
          warnings: [],
        }),
      };
      const mockTenantService = {
        provisionOrRepairTenant: jest.fn().mockResolvedValue({ repaired: false, reason: 'user_not_associated' }),
        setupSchool: jest.fn(),
      };
      mockHealthService.checkHealth.mockResolvedValue({
        healthy: false,
        status: 'INVALID',
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: false,
          schemaValid: false,
        },
      });
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning, mockTenantService);

      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
          requiredLabs: [] as any[],
          requiredTeachers: {} as Record<string, number>,
        },
      };

      await expect(svc.saveAndPublishConfiguration(input, tenantId, 'user1')).rejects.toThrow('Tenant');
      expect(mockTenantService.provisionOrRepairTenant).toHaveBeenCalledWith(tenantId, 'user1');
      expect(provisioning.provisionFromConfiguration).not.toHaveBeenCalled();
      expect(repoMock.publishConfiguration).not.toHaveBeenCalled();
      expect(mockCache.invalidateConfiguration).not.toHaveBeenCalled();
      expect(mockCache.setConfiguration).not.toHaveBeenCalled();
    });

    test('should repair tenant and continue when tenant document is missing but user owns it', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockImplementation((_tenantId: string, config: any) => {
        config.state = 'Published';
        config.metadata.isConfigured = true;
        config.metadata.configuredAt = new Date().toISOString();
        config.metadata.configuredBy = 'user1';
        config.metadata.publishedAt = new Date().toISOString();
        config.version.publishedBy = 'user1';
        config.version.publishedAt = new Date().toISOString();
        config.metadata.lastModified = new Date().toISOString();
        return config;
      });
      repoMock.getConfiguration = jest.fn().mockResolvedValue(mockConfigData(tenantId));
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: 'ay-repaired-1',
          sectionsCreated: 2,
          departmentsCreated: 1,
          warnings: [],
        }),
      };
      const mockTenantService = {
        provisionOrRepairTenant: jest.fn().mockResolvedValue({ repaired: true, reason: 'tenant_restored_from_configuration' }),
        setupSchool: jest.fn(),
      };
      mockHealthService.checkHealth
        .mockResolvedValueOnce({
          healthy: false,
          status: 'INVALID',
          diagnostics: {
            configExists: false,
            metadataExists: false,
            schoolProfileExists: false,
            academicStructureExists: false,
            isPublished: false,
            versionValid: false,
            tenantValid: false,
            schemaValid: false,
          },
        })
        .mockResolvedValue({
          healthy: true,
          status: 'CONFIGURED',
          diagnostics: {
            configExists: true,
            metadataExists: true,
            schoolProfileExists: true,
            academicStructureExists: true,
            isPublished: true,
            versionValid: true,
            tenantValid: true,
            schemaValid: true,
          },
        });
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning, mockTenantService);

      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
          requiredLabs: [] as any[],
          requiredTeachers: {} as Record<string, number>,
          departments: ['CS'],
        },
      };

      const result = await svc.saveAndPublishConfiguration(input, tenantId, 'user1');

      expect(mockTenantService.provisionOrRepairTenant).toHaveBeenCalledWith(tenantId, 'user1');
      expect(mockHealthService.checkHealth).toHaveBeenCalledTimes(2);
      expect(provisioning.provisionFromConfiguration).toHaveBeenCalledTimes(1);
      expect(repoMock.publishConfiguration).toHaveBeenCalledTimes(1);
      expect(result.state).toBe('Published');
      expect(result.metadata.academicYearId).toBe('ay-repaired-1');
    });

    test('should not invent academic year when metadata.academicYearId is null', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockImplementation((_tenantId: string, config: any) => {
        config.state = 'Published';
        config.metadata.isConfigured = true;
        config.metadata.configuredAt = new Date().toISOString();
        config.metadata.configuredBy = 'user1';
        config.metadata.publishedAt = new Date().toISOString();
        config.version.publishedBy = 'user1';
        config.version.publishedAt = new Date().toISOString();
        config.metadata.lastModified = new Date().toISOString();
        return config;
      });
      const existingNullAy = {
        ...mockConfigData(tenantId),
        metadata: { ...mockConfigData(tenantId).metadata, academicYearId: null },
      };
      repoMock.getConfiguration = jest.fn().mockResolvedValue(existingNullAy);
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: 'ay-newly-created',
          sectionsCreated: 0,
          departmentsCreated: 0,
          warnings: [],
        }),
      };
      const mockTenantService = {
        provisionOrRepairTenant: jest.fn().mockResolvedValue({ repaired: true }),
        setupSchool: jest.fn(),
      };
      mockHealthService.checkHealth
        .mockResolvedValueOnce({
          healthy: false,
          status: 'INVALID',
          diagnostics: { configExists: true, metadataExists: true, schoolProfileExists: true, academicStructureExists: true, isPublished: true, versionValid: true, tenantValid: false, schemaValid: true },
        })
        .mockResolvedValue({
          healthy: true,
          status: 'CONFIGURED',
          diagnostics: { configExists: true, metadataExists: true, schoolProfileExists: true, academicStructureExists: true, isPublished: true, versionValid: true, tenantValid: true, schemaValid: true },
        });
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning, mockTenantService);

      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
          requiredLabs: [] as any[],
          requiredTeachers: {} as Record<string, number>,
        },
      };

      const result = await svc.saveAndPublishConfiguration(input, tenantId, 'user1');

      expect(mockTenantService.provisionOrRepairTenant).toHaveBeenCalledWith(tenantId, 'user1');
      expect(provisioning.provisionFromConfiguration).toHaveBeenCalledTimes(1);
      expect(result.metadata.academicYearId).toBe('ay-newly-created');
      expect(mockTenantService.provisionOrRepairTenant).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ createAcademicYear: true })
      );
    });

    test('should throw when tenant repair fails and tenant remains invalid', async () => {
      const repoMock = new ConfigurationRepository() as jest.Mocked<ConfigurationRepository>;
      repoMock.publishConfiguration = jest.fn().mockResolvedValue(undefined as any);
      repoMock.getConfiguration = jest.fn().mockResolvedValue(null);
      repoMock.saveConfiguration = jest.fn().mockResolvedValue(undefined);
      const provisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: 'ay-1',
          sectionsCreated: 0,
          departmentsCreated: 0,
          warnings: [],
        }),
      };
      const mockTenantService = {
        provisionOrRepairTenant: jest.fn().mockResolvedValue({ repaired: false, reason: 'config_missing' }),
        setupSchool: jest.fn(),
      };
      mockHealthService.checkHealth.mockResolvedValue({
        healthy: false,
        status: 'INVALID',
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: false,
          schemaValid: false,
        },
      });
      const svc = new ConfigurationService(repoMock, mockCache, mockHealthService, provisioning, mockTenantService);

      const input = {
        schoolProfile: { name: 'Test School', type: 'Private', curriculumId: 'federal', sections: ['A'] },
        academicStructure: {
          levels: [] as any[],
          grades: [{ id: 'g1', name: 'Grade 1', levelId: 'Primary', schemeOfStudy: { subjects: [{ name: 'Math' }] } }],
          allSubjects: [{ name: 'Math' }],
          requiredLabs: [] as any[],
          requiredTeachers: {} as Record<string, number>,
        },
      };

      await expect(svc.saveAndPublishConfiguration(input, tenantId, 'user1')).rejects.toThrow('Tenant');
      expect(mockTenantService.provisionOrRepairTenant).toHaveBeenCalledWith(tenantId, 'user1');
      expect(provisioning.provisionFromConfiguration).not.toHaveBeenCalled();
      expect(repoMock.publishConfiguration).not.toHaveBeenCalled();
    });
  });

  describe('getHealthStatus', () => {
    test('should delegate to health service', async () => {
      const healthResult = { healthy: true, status: 'CONFIGURED' as const, diagnostics: { configExists: true, metadataExists: true, schoolProfileExists: true, academicStructureExists: true, isPublished: true, versionValid: true, tenantValid: true, schemaValid: true } };

      mockHealthService.checkHealth.mockResolvedValue(healthResult);

      const result = await service.getHealthStatus(tenantId);

      expect(result.healthy).toBe(true);
      expect(result.status).toBe('CONFIGURED');
    });
  });
});
