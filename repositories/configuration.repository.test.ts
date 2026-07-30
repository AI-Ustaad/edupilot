import { ConfigurationRepository } from '@/repositories/configuration.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

jest.mock('@/lib/mappers/configuration.mapper', () => ({
  mapToMasterConfiguration: jest.fn((data, tenantId) => ({ ...data, tenantId })),
  mapToDbDocument: jest.fn((config) => config),
}));

jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('ConfigurationRepository', () => {
  let repo: ConfigurationRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ConfigurationRepository();
  });

  describe('Configuration CRUD', () => {
    test('should get configuration by tenant ID', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                exists: true,
                id: 'config',
                data: () => ({
                  id: 'config',
                  tenantId,
                  state: 'Published',
                  metadata: { tenantId, configurationVersion: 1, schemaVersion: 2, lastModified: new Date().toISOString() },
                  version: { number: 1, createdBy: 'user1', createdAt: new Date().toISOString(), reason: 'Initial' },
                  school: { name: 'Test School', type: 'Private', curriculumId: 'c1', boardName: 'FBISE', country: 'PK' },
                  academic: { levels: [], classes: [], sectionNames: [], subjects: [], requiredLabs: [], requiredTeachers: {} },
                  features: { ai: { enabled: true }, library: { enabled: true } },
                }),
              }),
            }),
          }),
        }),
      });

      const config = await repo.getConfiguration(tenantId);
      expect(config).not.toBeNull();
      expect(config!.school.name).toBe('Test School');
    });

    test('should return null for non-existent configuration', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
            }),
          }),
        }),
      });

      const config = await repo.getConfiguration(tenantId);
      expect(config).toBeNull();
    });

    test('should save configuration', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      const mockDocRef = {
        set: jest.fn().mockResolvedValue(undefined),
      };
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue(mockDocRef),
          }),
        }),
      });

      const mockConfig = {
        id: 'current',
        tenantId,
        state: 'Published',
        metadata: { tenantId, configurationVersion: 1, schemaVersion: 2, lastModified: new Date().toISOString() },
        version: { number: 1, createdBy: 'user1', createdAt: new Date().toISOString(), reason: 'Initial' },
        school: { name: 'Test', type: 'Private', curriculumId: 'c1', boardName: 'B', country: 'PK' },
        academic: { levels: [''], classes: [], sectionNames: [''], subjects: [''], requiredLabs: [], requiredTeachers: {} },
        features: { ai: { enabled: true } },
      };

      await repo.saveConfiguration(tenantId, mockConfig as any);
      expect(mockDocRef.set).toHaveBeenCalled();
    });

    test('should update configuration', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: 'config',
          data: () => ({
            id: 'config',
            tenantId,
            state: 'Published',
            metadata: { tenantId, configurationVersion: 1 },
            version: { number: 1 },
            school: { name: 'Test' },
            academic: { levels: [], classes: [], sectionNames: [], subjects: [], requiredLabs: [], requiredTeachers: {} },
            features: {},
          }),
        }),
        set: jest.fn().mockResolvedValue(undefined),
      };
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue(mockDocRef),
          }),
        }),
      });

      const result = await repo.updateConfiguration(tenantId, { state: 'Locked' } as any);
      expect(result.tenantId).toBe(tenantId);
    });

    test('should publish configuration', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      const mockConfigDocRef = {
        set: jest.fn().mockResolvedValue(undefined),
      };
      const mockHistoryDocRef = {
        set: jest.fn().mockResolvedValue(undefined),
      };

      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn((collectionName: string) => {
            if (collectionName === 'settings') {
              return {
                doc: jest.fn().mockReturnValue({
                  ...mockConfigDocRef,
                  collection: jest.fn().mockReturnValue({
                    doc: jest.fn().mockReturnValue(mockHistoryDocRef),
                  }),
                }),
              };
            }
            return {
              doc: jest.fn().mockReturnValue(mockHistoryDocRef),
            };
          }),
        }),
      });

      const mockConfig = {
        id: 'current',
        tenantId,
        state: 'Draft',
        metadata: { tenantId, configurationVersion: 0, schemaVersion: 2, lastModified: new Date().toISOString() },
        version: { number: 0, createdBy: 'user1', createdAt: new Date().toISOString(), reason: 'Initial' },
        school: { name: 'Test', type: 'Private', curriculumId: 'c1', boardName: 'B', country: 'PK' },
        academic: { levels: [], classes: [], sectionNames: [], subjects: [], requiredLabs: [], requiredTeachers: {} },
        features: { ai: { enabled: true } },
      };

      const result = await repo.publishConfiguration(tenantId, mockConfig as any, 'user1');
      expect(result.state).toBe('Published');
      expect(result.metadata.isConfigured).toBe(true);
      expect(result.metadata.configuredBy).toBe('user1');
    });

    test('should delete configuration', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      const mockDocRef = {
        delete: jest.fn().mockResolvedValue(undefined),
      };
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue(mockDocRef),
          }),
        }),
      });

      await repo.deleteConfiguration(tenantId);
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    test('should check configuration exists', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
            }),
          }),
        }),
      });

      const exists = await repo.configurationExists(tenantId);
      expect(exists).toBe(true);
    });
  });

  describe('Configuration History', () => {
    test('should get configuration history', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn((collectionName: string) => {
            if (collectionName === 'settings') {
              return {
                doc: jest.fn().mockReturnValue({
                  collection: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockReturnThis(),
                    get: jest.fn().mockResolvedValue({
                      docs: [
                        { id: 'h1', data: () => ({ version: { number: 2 } }) },
                        { id: 'h2', data: () => ({ version: { number: 1 } }) },
                      ],
                    }),
                  }),
                }),
              };
            }
            return {
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                docs: [
                  { id: 'h1', data: () => ({ version: { number: 2 } }) },
                  { id: 'h2', data: () => ({ version: { number: 1 } }) },
                ],
              }),
            };
          }),
        }),
      });

      const history = await repo.getConfigurationHistory(tenantId, 50);
      expect(history).toHaveLength(2);
    });

    test('should return empty history on error', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn((collectionName: string) => {
            if (collectionName === 'settings') {
              return {
                doc: jest.fn().mockReturnValue({
                  collection: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockReturnThis(),
                    get: jest.fn().mockRejectedValue(new Error('Firestore error')),
                  }),
                }),
              };
            }
            return {
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              get: jest.fn().mockRejectedValue(new Error('Firestore error')),
            };
          }),
        }),
      });

      const history = await repo.getConfigurationHistory(tenantId);
      expect(history).toEqual([]);
    });
  });

  describe('Tenant Metadata', () => {
    test('should get tenant metadata', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              metadata: {
                tenantId,
                configurationVersion: 1,
                schemaVersion: 2,
                environment: 'production',
                region: 'PK',
                timezone: 'Asia/Karachi',
                lastModified: new Date().toISOString(),
              },
            }),
          }),
        }),
      });

      const metadata = await repo.getTenantMetadata(tenantId);
      expect(metadata).not.toBeNull();
      expect(metadata!.tenantId).toBe(tenantId);
    });

    test('should return default metadata for missing config', async () => {
      const { adminDb } = require('@/lib/firebase-admin');
      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false }),
        }),
      });

      const metadata = await repo.getTenantMetadata(tenantId);
      expect(metadata).not.toBeNull();
      expect(metadata!.configurationVersion).toBe(0);
    });
  });
});