import { SubscriptionRepository } from '@/repositories/subscription.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

jest.mock('@/lib/cache', () => ({
  invalidateCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/events/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SubscriptionRepository', () => {
  let repo: SubscriptionRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SubscriptionRepository();
  });

  test('should find subscription by tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ planId: 'pro', status: 'active' }),
    });

    const sub = await repo.findByTenant(tenantId);
    expect(sub).not.toBeNull();
    expect(sub!.planId).toBe('pro');
  });

  test('should return null for non-existent subscription', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const sub = await repo.findByTenant(tenantId);
    expect(sub).toBeNull();
  });

  test('should activate subscription', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ planId: 'free' }),
    });

    await repo.activate(tenantId, 'pro', 'user-1');
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'pro', status: 'active' }),
      { merge: true }
    );
  });

  test('should activate subscription without user', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ planId: 'free' }),
    });

    await repo.activate(tenantId, 'pro');
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'pro', status: 'active' }),
      { merge: true }
    );
  });

  test('should cancel subscription', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ planId: 'pro' }),
    });

    await repo.cancel(tenantId, 'user-1');
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'free', status: 'canceled' }),
      { merge: true }
    );
  });

  test('should cancel subscription without user', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ planId: 'pro' }),
    });

    await repo.cancel(tenantId);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'free', status: 'canceled' }),
      { merge: true }
    );
  });

  test('should list all subscriptions', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.get.mockResolvedValue({
      docs: [
        { id: 'sub1', data: () => ({ tenantId, planId: 'pro' }) },
        { id: 'sub2', data: () => ({ tenantId, planId: 'free' }) },
      ],
    });

    const subs = await repo.listAll();
    expect(subs).toHaveLength(2);
  });

  test('should find all subscriptions', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'sub1', data: () => ({ tenantId }) },
      ],
    });

    const subs = await repo.findAll(tenantId);
    expect(subs).toHaveLength(1);
  });

  test('should find subscription by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'sub1',
      data: () => ({ tenantId, planId: 'pro' }),
    });

    const sub = await repo.findById('sub1', tenantId);
    expect(sub).not.toBeNull();
  });

  test('should create a subscription', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'sub-123' });

    const data = { planId: 'pro', status: 'active' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('sub-123');
  });

  test('should update a subscription', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'sub1',
      data: () => ({ tenantId, planId: 'pro' }),
    });

    await repo.update('sub1', { status: 'canceled' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'canceled' })
    );
  });

  test('should delete a subscription', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'sub1',
      data: () => ({ tenantId }),
    });

    await repo.delete('sub1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'sub1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('sub1', { status: 'canceled' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should paginate subscriptions', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'sub1', data: () => ({ tenantId }) },
        { id: 'sub2', data: () => ({ tenantId }) },
        { id: 'sub3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count subscriptions', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 12 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(12);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('sub1', tenantId);
    expect(exists).toBe(true);
  });
});