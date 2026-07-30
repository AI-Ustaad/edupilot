import { TimetableRepository } from '@/repositories/timetable.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('TimetableRepository', () => {
  let repo: TimetableRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new TimetableRepository();
  });

  test('should find timetable entry by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 't1',
      data: () => ({ tenantId, day: 'Monday', subject: 'Math' }),
    });

    const entry = await repo.findById('t1', tenantId);
    expect(entry).not.toBeNull();
    expect(entry!.subject).toBe('Math');
  });

  test('should return null for non-existent timetable entry', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const entry = await repo.findById('nonexistent', tenantId);
    expect(entry).toBeNull();
  });

  test('should create a timetable entry', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'timetable-123' });

    const data = { day: 'Monday', subject: 'Math', teacherId: 't1' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('timetable-123');
  });

  test('should update a timetable entry', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 't1',
      data: () => ({ tenantId, day: 'Monday' }),
    });

    await repo.update('t1', { day: 'Tuesday' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ day: 'Tuesday' })
    );
  });

  test('should delete a timetable entry', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 't1',
      data: () => ({ tenantId }),
    });

    await repo.delete('t1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 't1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('t1', { day: 'Tuesday' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all timetable entries', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ tenantId }) },
      ],
    });

    const entries = await repo.findAll(tenantId);
    expect(entries).toHaveLength(1);
  });

  test('should paginate timetable entries', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ tenantId }) },
        { id: 't2', data: () => ({ tenantId }) },
        { id: 't3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count timetable entries', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 20 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(20);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('t1', tenantId);
    expect(exists).toBe(true);
  });
});