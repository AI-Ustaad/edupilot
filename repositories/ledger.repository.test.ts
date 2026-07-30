import { LedgerRepository } from '@/repositories/ledger.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('LedgerRepository', () => {
  let repo: LedgerRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new LedgerRepository();
  });

  test('should create a ledger entry and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'ledger-123' });

    const data = { type: 'income', description: 'Fee payment', amount: 500, tenantId, createdBy: 'user-1' };
    const id = await repo.createEntry(data, tenantId);
    expect(id).toBe('ledger-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        tenantId,
      })
    );
  });

  test('should find ledger entries by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'l1', data: () => ({ tenantId, type: 'income', amount: 100 }) },
        { id: 'l2', data: () => ({ tenantId, type: 'expense', amount: 50 }) },
      ],
    });

    const entries = await repo.findByTenant(tenantId);
    expect(entries).toHaveLength(2);
  });

  test('should find ledger entry by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'l1',
      data: () => ({ tenantId, type: 'income', amount: 100 }),
    });

    const entry = await repo.findById('l1', tenantId);
    expect(entry).not.toBeNull();
    expect(entry!.type).toBe('income');
  });

  test('should return null for non-existent ledger entry', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const entry = await repo.findById('nonexistent', tenantId);
    expect(entry).toBeNull();
  });

  test('should update a ledger entry', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'l1',
      data: () => ({ tenantId, amount: 100 }),
    });

    await repo.update('l1', { amount: 150 }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 150 })
    );
  });

  test('should delete a ledger entry', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'l1',
      data: () => ({ tenantId }),
    });

    await repo.delete('l1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'l1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('l1', { amount: 150 }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all ledger entries', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'l1', data: () => ({ tenantId }) },
      ],
    });

    const entries = await repo.findAll(tenantId);
    expect(entries).toHaveLength(1);
  });

  test('should paginate ledger entries', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'l1', data: () => ({ tenantId }) },
        { id: 'l2', data: () => ({ tenantId }) },
        { id: 'l3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count ledger entries', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 15 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(15);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('l1', tenantId);
    expect(exists).toBe(true);
  });
});