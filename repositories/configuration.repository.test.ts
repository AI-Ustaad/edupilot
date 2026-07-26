import { ConfigurationRepository } from '@/repositories/configuration.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'config-123' }),
    doc: jest.fn().mockReturnValue(mockDocRef),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  };
  return {
    adminDb: {
      collection: jest.fn().mockReturnValue(mockCollection),
    },
    dbTimestamp: new Date().toISOString(),
    mockDocRef,
    mockCollection,
  };
});

jest.mock('@/lib/mappers/configuration.mapper', () => ({
  mapToMasterConfiguration: jest.fn((data, tenantId) => ({ ...data, tenantId })),
}));

describe('ConfigurationRepository', () => {
  let repo: ConfigurationRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ConfigurationRepository();
  });

  test('should get config', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'config',
      data: () => ({ theme: 'dark' }),
    });

    const config = await repo.getConfig(tenantId);
    expect(config).not.toBeNull();
    expect(config!.theme).toBe('dark');
  });

  test('should return null for non-existent config', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const config = await repo.getConfig(tenantId);
    expect(config).toBeNull();
  });

  test('should update config', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ theme: 'light' }),
    });

    await repo.updateConfig(tenantId, { theme: 'dark' });
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' }),
      { merge: true }
    );
  });

  test('should get general settings', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'general',
      data: () => ({ language: 'en' }),
    });

    const general = await repo.getGeneral(tenantId);
    expect(general).not.toBeNull();
    expect(general!.language).toBe('en');
  });

  test('should return null for non-existent general settings', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const general = await repo.getGeneral(tenantId);
    expect(general).toBeNull();
  });

  test('should update general settings', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ language: 'en' }),
    });

    await repo.updateGeneral(tenantId, { language: 'fr' });
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'fr' }),
      { merge: true }
    );
  });

  test('should get active configuration', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'config',
      data: () => ({ theme: 'dark' }),
    });

    const config = await repo.getActiveConfiguration(tenantId);
    expect(config).not.toBeNull();
  });

  test('should save configuration', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ theme: 'light' }),
    });

    await repo.saveConfiguration(tenantId, { theme: 'dark' });
    expect(mockDocRef.set).toHaveBeenCalled();
  });

  test('should get configuration history', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    adminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [
              { id: 'h1', data: () => ({ version: 1 }) },
              { id: 'h2', data: () => ({ version: 2 }) },
            ],
          }),
        }),
      }),
    });

    const history = await repo.getConfigurationHistory(tenantId);
    expect(history).toHaveLength(2);
  });
});