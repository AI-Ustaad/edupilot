import { BehaviorRepository } from '@/repositories/behavior.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('BehaviorRepository', () => {
  let repo: BehaviorRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BehaviorRepository();
  });

  test('should create behavior log and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'behavior-123' });

    const data = {
      studentId: 'student-1',
      tenantId,
      points: 5,
      reason: 'Helped a classmate',
      recordedBy: 'teacher-1',
    };
    const id = await repo.create(data, tenantId);
    expect(id).toBe('behavior-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-1',
      })
    );
  });

  test('should find behavior by student', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ studentId: 'student-1', type: 'positive', tenantId }) },
        { id: 'b2', data: () => ({ studentId: 'student-1', type: 'negative', tenantId }) },
      ],
    });

    const logs = await repo.findByStudent('student-1', tenantId);
    expect(logs).toHaveLength(2);
    expect(logs[0].studentId).toBe('student-1');
  });

  test('should limit behavior logs by student', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ studentId: 'student-1', type: 'positive', tenantId }) },
      ],
    });

    const logs = await repo.findByStudent('student-1', tenantId, 1);
    expect(logs).toHaveLength(1);
    expect(mockQuery.limit).toHaveBeenCalledWith(1);
  });

  test('should find behavior log by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'behavior-456',
      data: () => ({
        studentId: 'student-1',
        type: 'positive',
        description: 'Helped a classmate',
        tenantId,
      }),
    });

    const log = await repo.findById('behavior-456', tenantId);
    expect(log).not.toBeNull();
    expect(log!.studentId).toBe('student-1');
  });

  test('should return null for non-existent behavior log', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const log = await repo.findById('nonexistent', tenantId);
    expect(log).toBeNull();
  });

  test('should update behavior log', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'behavior-789',
      data: () => ({ type: 'positive', tenantId }),
    });

    await repo.update('behavior-789', { type: 'negative' } as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'negative' })
    );
  });

  test('should delete behavior log', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'behavior-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('behavior-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'behavior-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('behavior-789', { type: 'negative' } as any, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all behavior logs for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ points: 5, reason: 'Helped a classmate', tenantId }) },
        { id: 'b2', data: () => ({ points: -3, reason: 'Disruptive behavior', tenantId }) },
      ],
    });

    const logs = await repo.findAll(tenantId);
    expect(logs).toHaveLength(2);
    expect(logs[0].reason).toBe('Helped a classmate');
  });

  test('should paginate behavior logs', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ type: 'positive', tenantId }) },
        { id: 'b2', data: () => ({ type: 'negative', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  test('should count behavior logs', async () => {
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

    const exists = await repo.exists('behavior-1', tenantId);
    expect(exists).toBe(true);
  });
});
