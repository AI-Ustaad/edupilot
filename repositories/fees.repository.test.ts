import { FeesRepository } from '@/repositories/fees.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('FeesRepository', () => {
  let repo: FeesRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new FeesRepository();
  });

  test('should find fees by student', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId, studentId: 's1', amountPaid: 100 }) },
        { id: 'f2', data: () => ({ tenantId, studentId: 's1', amountPaid: 50 }) },
      ],
    });

    const fees = await repo.findByStudent(tenantId, 's1');
    expect(fees).toHaveLength(2);
  });

  test('should find fees with filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId, studentId: 's1', paid: true }) },
      ],
    });

    const fees = await repo.findWithFilters(tenantId, { studentId: 's1', paid: true });
    expect(fees).toHaveLength(1);
  });

  test('should get total revenue', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId, amountPaid: 100 }) },
        { id: 'f2', data: () => ({ tenantId, amountPaid: 50 }) },
        { id: 'f3', data: () => ({ tenantId, amountPaid: 25 }) },
      ],
    });

    const revenue = await repo.getTotalRevenue(tenantId);
    expect(revenue).toBe(175);
  });

  test('should return zero revenue for empty results', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({ docs: [] });

    const revenue = await repo.getTotalRevenue(tenantId);
    expect(revenue).toBe(0);
  });

  test('should get recent payments', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId, amountPaid: 100 }) },
      ],
    });

    const payments = await repo.getRecentPayments(tenantId, 5);
    expect(payments).toHaveLength(1);
  });

  test('should count fees', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId }) },
        { id: 'f2', data: () => ({ tenantId }) },
      ],
      size: 2,
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(2);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('f1', tenantId);
    expect(exists).toBe(true);
  });

  test('should save a fee document (update existing)', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'f1',
      data: () => ({ tenantId }),
    });

    const document = { id: 'f1', tenantId, studentId: 's1', feeMonth: '2024-01', amountPaid: 100, paymentMethod: 'Cash' };
    await repo.save(document, tenantId);
    expect(mockDocRef.update).toHaveBeenCalled();
  });

  test('should find fee by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'f1',
      data: () => ({ tenantId, amount: 100 }),
    });

    const fee = await repo.findById('f1', tenantId);
    expect(fee).not.toBeNull();
    expect(fee!.amount).toBe(100);
  });

  test('should create a fee', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'fee-123' });

    const data = { studentId: 's1', amount: 100 };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('fee-123');
  });

  test('should update a fee', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'f1',
      data: () => ({ tenantId, amount: 50 }),
    });

    await repo.update('f1', { amount: 100 }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100 })
    );
  });

  test('should delete a fee', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'f1',
      data: () => ({ tenantId }),
    });

    await repo.delete('f1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'f1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('f1', { amount: 100 }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all fees', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId }) },
      ],
    });

    const fees = await repo.findAll(tenantId);
    expect(fees).toHaveLength(1);
  });

  test('should paginate fees', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ tenantId }) },
        { id: 'f2', data: () => ({ tenantId }) },
        { id: 'f3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });
});