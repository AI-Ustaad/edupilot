import { DashboardStatsRepository } from '@/repositories/dashboard-stats.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('DashboardStatsRepository', () => {
  let repo: DashboardStatsRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new DashboardStatsRepository();
  });

  test('should find stats by tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ totalStudents: 100, totalStaff: 10 }),
    });

    const stats = await repo.findByTenant(tenantId);
    expect(stats).not.toBeNull();
    expect(stats!.totalStudents).toBe(100);
  });

  test('should return null for non-existent stats', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const stats = await repo.findByTenant(tenantId);
    expect(stats).toBeNull();
  });

  test('should update stats', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ totalStudents: 100 }),
    });

    await repo.updateStats(tenantId, { totalStudents: 150 });
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ totalStudents: 150 }),
      { merge: true }
    );
  });

  test('should increment a counter', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ totalStudents: 100 }),
    });

    await repo.incrementCounter(tenantId, 'totalStudents', 5);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ totalStudents: { operand: 5 } })
    );
  });
});