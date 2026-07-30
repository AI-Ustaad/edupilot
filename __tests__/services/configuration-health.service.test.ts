import { ConfigurationHealthService } from "@/services/configuration-health.service";
import { createFirestoreTestFactory } from "@/__tests__/utils/firestore-mock";

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const { adminDb, mockDocRef } = require('@/lib/firebase-admin');

describe('ConfigurationHealthService', () => {
  let service: ConfigurationHealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigurationHealthService();
  });

  describe('checkHealth', () => {
    test('should return healthy when configuration is complete', async () => {
      mockDocRef.get.mockResolvedValue({ exists: true, data: () => ({}) });
      
      const settingsCollection = mockDocRef.collection('settings');
      const configDocRef = settingsCollection.doc('config');
      configDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({
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
        }),
      });

      const result = await service.checkHealth('tenant_1');

      expect(result.healthy).toBe(true);
      expect(result.status).toBe('CONFIGURED');
    });

    test('should return NOT_CONFIGURED when config does not exist', async () => {
      mockDocRef.get.mockResolvedValue({ exists: true, data: () => ({}) });
      
      const settingsCollection = mockDocRef.collection('settings');
      const configDocRef = settingsCollection.doc('config');
      configDocRef.get.mockResolvedValue({ exists: false, data: () => null });

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('NOT_CONFIGURED');
      expect(result.healthy).toBe(false);
    });

    test('should return INVALID when tenant does not exist', async () => {
      mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('INVALID');
      expect(result.healthy).toBe(false);
    });

    test('should return PARTIALLY_CONFIGURED when metadata is missing', async () => {
      mockDocRef.get.mockResolvedValue({ exists: true, data: () => ({}) });
      
      const settingsCollection = mockDocRef.collection('settings');
      const configDocRef = settingsCollection.doc('config');
      configDocRef.get.mockResolvedValue({
        exists: true,
        data: () => ({
          state: 'Published',
          metadata: { configurationVersion: 1, schemaVersion: 2 },
          version: { number: 1 },
        }),
      });

      const result = await service.checkHealth('tenant_1');

      expect(result.status).toBe('PARTIALLY_CONFIGURED');
      expect(result.healthy).toBe(false);
    });
  });
});
