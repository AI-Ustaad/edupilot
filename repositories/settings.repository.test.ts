import { SettingsRepository } from '@/repositories/settings.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockCountSnap = { data: () => ({ count: 0 }) };
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    }),
  };

  // Stable memoized mocks
  const collectionCache = new Map();
  const docCache = new Map();

  const makeDoc = (fullPath: string) => {
    if (docCache.has(fullPath)) {
      return docCache.get(fullPath);
    }

    const doc = {
      get: jest.fn().mockResolvedValue({ exists: false, data: () => undefined }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      id: fullPath.split('/').pop() || 'mock-doc-id',
      collection: jest.fn((subCollectionName: string) => {
        return makeCollection(fullPath + '/' + subCollectionName);
      }),
    };

    docCache.set(fullPath, doc);
    return doc;
  };

  const makeCollection = (path: string) => {
    if (collectionCache.has(path)) {
      return collectionCache.get(path);
    }

    const collection = {
      add: jest.fn().mockResolvedValue({ id: 'added-id' }),
      doc: jest.fn((docId?: string) => {
        const id = docId || 'mock-doc-id';
        return makeDoc(path + '/' + id);
      }),
      where: jest.fn().mockReturnValue(mockQuery),
      get: jest.fn().mockResolvedValue({ docs: [] }),
      orderBy: jest.fn().mockReturnValue(mockQuery),
      limit: jest.fn().mockReturnValue(mockQuery),
    };

    collectionCache.set(path, collection);
    return collection;
  };

  const mockBatch = {
    delete: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };

  return {
    adminDb: {
      collection: jest.fn((name: string) => makeCollection(name)),
      batch: jest.fn().mockReturnValue(mockBatch),
    },
    dbTimestamp: new Date().toISOString(),
    mockQuery,
    mockBatch,
  };
});

describe('SettingsRepository', () => {
  let repo: SettingsRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SettingsRepository();
  });

  test('should get config', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
    configDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({
        appName: 'Test App',
        theme: 'dark',
      }),
    });

    const config = await repo.getConfig(tenantId);
    expect(config).not.toBeNull();
    expect(config!.appName).toBe('Test App');
  });

  test('should return null when config does not exist', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
    configDoc.get.mockResolvedValue({
      exists: false,
      data: () => null,
    });

    const config = await repo.getConfig(tenantId);
    expect(config).toBeNull();
  });

  test('should update config', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
    configDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({}),
    });

    const data = { appName: 'Updated App', theme: 'light' };
    await repo.updateConfig(tenantId, data);
    expect(configDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: 'Updated App',
        theme: 'light',
        updatedAt: expect.any(String),
      }),
      { merge: true }
    );
  });

  test('should get configuration history', async () => {
    const { adminDb, mockQuery } = require('@/lib/firebase-admin');
    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');

    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'h1', data: () => ({ version: 1, appName: 'Old App' }) },
        { id: 'h2', data: () => ({ version: 2, appName: 'New App' }) },
      ],
    });

    const history = await repo.getConfigurationHistory(tenantId);
    expect(history).toHaveLength(2);
    expect(history[0].version).toBe(1);
  });

  test('should save configuration with history', async () => {
    const { adminDb, mockBatch } = require('@/lib/firebase-admin');
    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
    const historyCollection = configDoc.collection('history');
    const historyDoc = historyCollection.doc();
    configDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({}),
    });

    const configuration = { appName: 'Test App' };
    const historyEntry = { version: 3, changedBy: 'user-1' };
    await repo.saveConfigurationWithHistory(tenantId, configuration, historyEntry);
    expect(mockBatch.set).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  test('should get general settings', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const generalDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general');
    generalDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({
        language: 'en',
        timezone: 'Asia/Karachi',
      }),
    });

    const general = await repo.getGeneral(tenantId);
    expect(general).not.toBeNull();
    expect(general!.language).toBe('en');
  });

  test('should return null when general settings do not exist', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const generalDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general');
    generalDoc.get.mockResolvedValue({
      exists: false,
      data: () => null,
    });

    const general = await repo.getGeneral(tenantId);
    expect(general).toBeNull();
  });

  test('should update general settings', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const generalDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general');
    generalDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({}),
    });

    const data = { language: 'ur', timezone: 'Asia/Karachi' };
    await repo.updateGeneral(tenantId, data);
    expect(generalDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'ur',
        updatedAt: expect.any(String),
      }),
      { merge: true }
    );
  });
});
