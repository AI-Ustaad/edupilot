import { FeatureFlagRepository } from '@/repositories/feature-flag.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('FeatureFlagRepository', () => {
  let repo: FeatureFlagRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new FeatureFlagRepository();
  });

  test('should find flags by tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ features: { analytics: true } }),
    });

    const flags = await repo.findByTenant(tenantId);
    expect(flags).not.toBeNull();
    expect(flags!.features).toEqual({ analytics: true });
  });

  test('should return null for non-existent flags', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const flags = await repo.findByTenant(tenantId);
    expect(flags).toBeNull();
  });

  test('should set a feature flag', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ features: { analytics: false } }),
    });

    await repo.setFeature(tenantId, 'analytics', true);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ features: expect.objectContaining({ analytics: true }) }),
      { merge: true }
    );
  });

  test('should set feature on non-existing document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    await repo.setFeature(tenantId, 'darkMode', true);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ features: { darkMode: true } }),
      { merge: true }
    );
  });

  test('should get all flags', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ features: { analytics: true, darkMode: false } }),
    });

    const flags = await repo.getAllFlags(tenantId);
    expect(flags).toEqual({ analytics: true, darkMode: false });
  });

  test('should return empty object for non-existing flags', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const flags = await repo.getAllFlags(tenantId);
    expect(flags).toEqual({});
  });
});