import { AddonsRepository } from '@/repositories/addons.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
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
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    doc: jest.fn().mockReturnValue(mockDocRef),
    where: jest.fn().mockReturnValue(mockQuery),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  };
  const mockBatch = {
    delete: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };
  return {
    adminDb: {
      collection: jest.fn().mockReturnValue(mockCollection),
      batch: jest.fn().mockReturnValue(mockBatch),
    },
    dbTimestamp: new Date().toISOString(),
    mockDocRef,
    mockQuery,
    mockCollection,
    mockBatch,
  };
});

describe('AddonsRepository', () => {
  let repo: AddonsRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AddonsRepository();
  });

  test('should find addons by tenant', async () => {
    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ featureA: true, featureB: false }),
    });

    const result = await repo.findByTenant(tenantId);
    expect(result).toEqual({ featureA: true, featureB: false });
  });

  test('should return null when addons not found', async () => {
    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const result = await repo.findByTenant(tenantId);
    expect(result).toBeNull();
  });

  test('should save addons for a tenant', async () => {
    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.set.mockResolvedValue(undefined);

    const addons = { featureA: true, featureB: true };
    await repo.save(tenantId, addons);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        featureA: true,
        featureB: true,
      }),
      { merge: true }
    );
  });

  test('should get addons via getAddons', async () => {
    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ featureA: true }),
    });

    const result = await repo.getAddons(tenantId);
    expect(result).toEqual({ featureA: true });
  });

  test('should save addons via saveAddons', async () => {
    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.set.mockResolvedValue(undefined);

    const addons = { featureA: false, featureB: true };
    await repo.saveAddons(tenantId, addons);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        featureA: false,
        featureB: true,
      }),
      { merge: true }
    );
  });
});
