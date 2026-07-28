import { ConfigurationHealthService } from "@/services/configuration-health.service";

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn((...args: any[]) => {
        if (args.length === 2) {
          return argBuildHistory(args);
        }
        return mockConfigRef;
      }),
    }),
  },
}));

jest.mock('@/lib/logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

type DocFactory = (args: any[]) => any;

const mockTenantsRef: any = {
  get: jest.fn(),
};

const mockConfigRef: any = {
  get: jest.fn(),
};

const mockHistoryCollection: any = {
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
};

function buildDoc(data: any, exists: boolean) {
  return {
    exists,
    data: () => data,
  };
}

const argBuildHistory: DocFactory = () => mockHistoryCollection;

const mockAdminDb = require('@/lib/firebase-admin').adminDb;

describe('ConfigurationHealthService', () => {
  let service: ConfigurationHealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigurationHealthService();
  });

  describe('checkHealth', () => {
    test('should return healthy when configuration is complete', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: () => mockTenantsRef,
      });
      mockTenantsRef.get.mockResolvedValue(buildDoc({}, true));

      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[1] === 'config') return mockConfigRef;
          if (args[1] === 'history') return mockHistoryCollection;
          return { get: jest.fn() };
        },
      });

      mockConfigRef.get.mockResolvedValue(buildDoc({
        state: 'Published',
        metadata: {
          tenantId: 'tenant_1',
          configurationVersion: 1,
          schemaVersion: 2,
          lastModified: new Date().toISOString(),
          configuredAt: new Date().toISOString(),
          configuredBy: 'user1',
          environment: 'development',
          region: 'default',
          timezone: 'UTC',
        },
        version: { number: 1, createdAt: new Date().toISOString(), reason: 'Initial' },
        school: { name: 'Test School', type: 'Private', curriculumId: 'federal', boardName: 'FBISE', country: 'PK' },
        academic: { levels: ['Primary'], classes: [], sectionNames: ['A'], subjects: ['Math'], requiredLabs: [], requiredTeachers: {} },
      }, true));

      const result = await service.checkHealth('tenant_1');

      expect(result.healthy).toBe(true);
      expect(result.status).toBe('CONFIGURED');
    });

    test('should return NOT_CONFIGURED when config does not exist', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[0] === 'tenants' && args[1] === 'tenant_1') return mockTenantsRef;
          if (args[0] === 'tenants' && args[1] === 'tenant_1') return mockConfigRef;
          return { get: jest.fn() };
        },
      });

      mockTenantsRef.get.mockResolvedValue(buildDoc({}, true));
      mockConfigRef.get.mockResolvedValue(buildDoc({}, false));

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('NOT_CONFIGURED');
      expect(result.healthy).toBe(false);
    });

    test('should return INVALID when tenant does not exist', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[0] === 'tenants' && args[1] === 'tenant_1') return mockTenantsRef;
          return { get: jest.fn() };
        },
      });

      mockTenantsRef.get.mockResolvedValue(buildDoc({}, false));

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('INVALID');
      expect(result.healthy).toBe(false);
    });

    test('should return PARTIALLY_CONFIGURED when metadata is missing', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[0] === 'tenants' && args[1] === 'tenant_1') return mockTenantsRef;
          return { get: jest.fn() };
        },
      });

      mockTenantsRef.get.mockResolvedValue(buildDoc({}, true));
      mockConfigRef.get.mockResolvedValue(buildDoc({
        state: 'Published',
        metadata: { configurationVersion: 1, schemaVersion: 2 },
        version: { number: 1 },
      }, true));

      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[1] === 'config') return mockConfigRef;
          return mockTenantsRef;
        },
      });

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('PARTIALLY_CONFIGURED');
      expect(result.healthy).toBe(false);
    });
  });
});
