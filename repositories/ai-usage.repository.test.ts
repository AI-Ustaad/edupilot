import { AiUsageRepository } from '@/repositories/ai-usage.repository';

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

describe('AiUsageRepository', () => {
  let repo: AiUsageRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AiUsageRepository();
  });

  test('should create AI usage log and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'usage-123' });

    const data = {
      userId: 'user-1',
      model: 'gpt-4',
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
      cost: 0.001,
    };
    const id = await repo.logUsage(data, tenantId);
    expect(id).toBe('usage-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        model: 'gpt-4',
        tenantId,
      })
    );
  });

  test('should find AI usage by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'u1', data: () => ({ userId: 'user-1', model: 'gpt-4', tenantId }) },
        { id: 'u2', data: () => ({ userId: 'user-2', model: 'gpt-3.5', tenantId }) },
      ],
    });

    const usage = await repo.findByTenant(tenantId);
    expect(usage).toHaveLength(2);
    expect(usage[0].userId).toBe('user-1');
  });

  test('should find AI usage by tenant with date range', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'u1', data: () => ({ userId: 'user-1', model: 'gpt-4', tenantId, createdAt: '2024-06-01' }) },
      ],
    });

    const startDate = new Date('2024-06-01');
    const endDate = new Date('2024-06-30');
    const usage = await repo.findByTenant(tenantId, startDate, endDate);
    expect(usage).toHaveLength(1);
  });

  test('should get usage stats', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'u1', data: () => ({ userId: 'user-1', totalTokens: 100, cost: 0.5, tenantId }) },
        { id: 'u2', data: () => ({ userId: 'user-2', totalTokens: 200, cost: 1.0, tenantId }) },
      ],
    });

    const stats = await repo.getUsageStats(tenantId, 30);
    expect(stats.totalTokens).toBe(300);
    expect(stats.totalCost).toBe(1.5);
  });

  test('should find AI usage by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'usage-456',
      data: () => ({
        userId: 'user-1',
        model: 'gpt-4',
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
        cost: 0.001,
        tenantId,
      }),
    });

    const usage = await repo.findById('usage-456', tenantId);
    expect(usage).not.toBeNull();
    expect(usage!.userId).toBe('user-1');
  });

  test('should return null for non-existent AI usage', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const usage = await repo.findById('nonexistent', tenantId);
    expect(usage).toBeNull();
  });

  test('should update AI usage', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'usage-789',
      data: () => ({ userId: 'user-1', tenantId }),
    });

    await repo.update('usage-789', { cost: 0.002 }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ cost: 0.002 })
    );
  });

  test('should delete AI usage', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'usage-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('usage-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'usage-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('usage-789', { cost: 0.002 }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should count AI usage', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 42 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(42);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('usage-1', tenantId);
    expect(exists).toBe(true);
  });
});
