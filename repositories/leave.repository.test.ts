import { LeaveRepository } from '@/repositories/leave.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('LeaveRepository', () => {
  let repo: LeaveRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new LeaveRepository();
  });

  test('should find pending leave requests by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'l1', data: () => ({ tenantId, status: 'pending', teacherId: 't1' }) },
        { id: 'l2', data: () => ({ tenantId, status: 'pending', teacherId: 't2' }) },
      ],
    });

    const leaves = await repo.findPendingByTenant(tenantId);
    expect(leaves).toHaveLength(2);
  });

  test('should update leave status', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    await repo.updateStatus('l1', { status: 'approved' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' })
    );
  });

  test('should update leave status without tenantId', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    await repo.updateStatus('l1', { status: 'approved' });
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' })
    );
  });

  test('should find leave by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'l1',
      data: () => ({ tenantId, status: 'pending' }),
    });

    const leave = await repo.findById('l1', tenantId);
    expect(leave).not.toBeNull();
  });

  test('should return null for non-existent leave', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const leave = await repo.findById('nonexistent', tenantId);
    expect(leave).toBeNull();
  });

  test('should update a leave request', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'l1',
      data: () => ({ tenantId, status: 'pending' }),
    });

    await repo.update('l1', { status: 'approved' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' })
    );
  });

  test('should delete a leave request', async () => {
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
      repo.update('l1', { status: 'approved' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all leave requests', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'l1', data: () => ({ tenantId }) },
      ],
    });

    const leaves = await repo.findAll(tenantId);
    expect(leaves).toHaveLength(1);
  });

  test('should paginate leave requests', async () => {
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

  test('should count leave requests', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 10 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(10);
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