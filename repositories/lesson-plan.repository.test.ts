import { LessonPlanRepository } from '@/repositories/lesson-plan.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('LessonPlanRepository', () => {
  let repo: LessonPlanRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new LessonPlanRepository();
  });

  test('should create a lesson plan and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'lp-123' });

    const data = { topic: 'Math Lesson', classGrade: '10' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('lp-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'Math Lesson',
        tenantId,
      })
    );
  });

  test('should find lesson plan by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'lp1',
      data: () => ({ topic: 'Math Lesson', tenantId }),
    });

    const lp = await repo.findById('lp1', tenantId);
    expect(lp).not.toBeNull();
    expect(lp!.topic).toBe('Math Lesson');
  });

  test('should return null for non-existent lesson plan', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const lp = await repo.findById('nonexistent', tenantId);
    expect(lp).toBeNull();
  });

  test('should update a lesson plan', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'lp1',
      data: () => ({ topic: 'Old Lesson', tenantId }),
    });

    await repo.update('lp1', { topic: 'Updated Lesson' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'Updated Lesson' })
    );
  });

  test('should delete a lesson plan', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'lp1',
      data: () => ({ tenantId }),
    });

    await repo.delete('lp1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'lp1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('lp1', { topic: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all lesson plans', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'lp1', data: () => ({ tenantId }) },
      ],
    });

    const lps = await repo.findAll(tenantId);
    expect(lps).toHaveLength(1);
  });

  test('should paginate lesson plans', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'lp1', data: () => ({ tenantId }) },
        { id: 'lp2', data: () => ({ tenantId }) },
        { id: 'lp3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count lesson plans', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 8 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(8);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('lp1', tenantId);
    expect(exists).toBe(true);
  });
});