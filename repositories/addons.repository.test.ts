import { AddonsRepository } from '@/repositories/addons.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
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
