import { HomeworkRepository } from '@/repositories/homework.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('HomeworkRepository', () => {
  let repo: HomeworkRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new HomeworkRepository();
  });

  test('should create homework and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'hw-123' });

    const data = { title: 'Math HW', classGrade: '10' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('hw-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Math HW',
        tenantId,
      })
    );
  });

  test('should find homework by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'hw1',
      data: () => ({ title: 'Math HW', tenantId }),
    });

    const homework = await repo.findById('hw1', tenantId);
    expect(homework).not.toBeNull();
    expect(homework!.title).toBe('Math HW');
  });

  test('should return null for non-existent homework', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const homework = await repo.findById('nonexistent', tenantId);
    expect(homework).toBeNull();
  });

  test('should update homework', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'hw1',
      data: () => ({ title: 'Old HW', tenantId }),
    });

    await repo.update('hw1', { title: 'Updated HW' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated HW' })
    );
  });

  test('should delete homework', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'hw1',
      data: () => ({ tenantId }),
    });

    await repo.delete('hw1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'hw1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('hw1', { title: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all homework', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'hw1', data: () => ({ tenantId }) },
      ],
    });

    const homework = await repo.findAll(tenantId);
    expect(homework).toHaveLength(1);
  });

  test('should paginate homework', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'hw1', data: () => ({ tenantId }) },
        { id: 'hw2', data: () => ({ tenantId }) },
        { id: 'hw3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count homework', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 7 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(7);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('hw1', tenantId);
    expect(exists).toBe(true);
  });
});