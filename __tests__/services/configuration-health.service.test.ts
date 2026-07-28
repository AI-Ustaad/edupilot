import { ConfigurationHealthService } from "@/services/configuration-health.service";

jest.mock('@/lib/firebase-admin', () => {
  const mockTenantsDoc: any = {
    get: jest.fn(),
    collection: jest.fn().mockReturnValue({
      doc: jest.fn(),
    }),
  };

  const mockSettingsDoc: any = {
    get: jest.fn(),
    collection: jest.fn().mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    }),
  };

  mockTenantsDoc.collection.mockReturnValue({
    doc: jest.fn(() => mockSettingsDoc),
  });

  return {
    adminDb: {
      collection: jest.fn().mockImplementation((name: string) => {
        if (name === "tenants") {
          return {
            doc: jest.fn(() => mockTenantsDoc),
          };
        }
        return {
          doc: jest.fn(),
        };
      }),
    },
    mockTenantsDoc,
    mockSettingsDoc,
  };
});

jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

type DocFactory = (args: any[]) => any;

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

const mockAdminDb = require('@/lib/firebase-admin').adminDb;

describe('ConfigurationHealthService', () => {
  let service: ConfigurationHealthService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new ConfigurationHealthService();
  });

  describe('checkHealth', () => {
    test('should return healthy when configuration is complete', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[0] === 'tenant_1') {
            return require('@/lib/firebase-admin').mockTenantsDoc;
          }
          return { get: jest.fn() };
        },
      });

      (require('@/lib/firebase-admin').mockTenantsDoc.get as jest.Mock).mockResolvedValue(buildDoc({}, true));

      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          if (args[0] === 'tenant_1') {
            return {
              ...require('@/lib/firebase-admin').mockTenantsDoc,
            };
          }
          return { get: jest.fn() };
        },
      });

      const mockConfigRef = require('@/lib/firebase-admin').mockSettingsDoc;
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

      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          const mockConfigRef = require('@/lib/firebase-admin').mockSettingsDoc;
          if (args[0] === 'tenant_1' && args[1] === 'settings') {
            return {
              doc: jest.fn(() => mockConfigRef),
            };
          }
          return { get: jest.fn() };
        },
      });

      const result = await service.checkHealth('tenant_1');

      expect(result.healthy).toBe(true);
      expect(result.status).toBe('CONFIGURED');
    });

    test('should return NOT_CONFIGURED when config does not exist', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          const mockTenantsDoc = require('@/lib/firebase-admin').mockTenantsDoc;
          if (args[0] === 'tenant_1') {
            return mockTenantsDoc;
          }
          return { get: jest.fn() };
        },
      });

      (require('@/lib/firebase-admin').mockTenantsDoc.get as jest.Mock).mockResolvedValue(buildDoc({}, true));

      (require('@/lib/firebase-admin').mockSettingsDoc.get as jest.Mock).mockResolvedValue(buildDoc({}, false));

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('NOT_CONFIGURED');
      expect(result.healthy).toBe(false);
    });

    test('should return INVALID when tenant does not exist', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          const mockTenantsDoc = require('@/lib/firebase-admin').mockTenantsDoc;
          if (args[0] === 'tenant_1') {
            return mockTenantsDoc;
          }
          return { get: jest.fn() };
        },
      });

      (require('@/lib/firebase-admin').mockTenantsDoc.get as jest.Mock).mockResolvedValue(buildDoc({}, false));

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('INVALID');
      expect(result.healthy).toBe(false);
    });

    test('should return PARTIALLY_CONFIGURED when metadata is missing', async () => {
      mockAdminDb.collection.mockReturnValue({
        doc: (...args: any[]) => {
          const mockTenantsDoc = require('@/lib/firebase-admin').mockTenantsDoc;
          if (args[0] === 'tenant_1') {
            return mockTenantsDoc;
          }
          return { get: jest.fn() };
        },
      });

      (require('@/lib/firebase-admin').mockTenantsDoc.get as jest.Mock).mockResolvedValue(buildDoc({}, true));

      (require('@/lib/firebase-admin').mockSettingsDoc.get as jest.Mock).mockResolvedValue(buildDoc({
        state: 'Published',
        metadata: { configurationVersion: 1, schemaVersion: 2 },
        version: { number: 1 },
      }, true));

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('PARTIALLY_CONFIGURED');
      expect(result.healthy).toBe(false);
    });
  });
});