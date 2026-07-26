import { DashboardStatsRepository } from '@/repositories/dashboard-stats.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
    }),
  };
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'stat-123' }),
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