import { SyllabusRepository } from '@/repositories/syllabus.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('SyllabusRepository', () => {
  let repo: SyllabusRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SyllabusRepository();
  });

  test('should find syllabi with filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ tenantId, classGrade: '10', subject: 'Math', title: 'Algebra' }) },
        { id: 's2', data: () => ({ tenantId, classGrade: '10', subject: 'Science', title: 'Physics' }) },
      ],
    });

    const syllabi = await repo.findWithFilters(tenantId, { classGrade: '10', subject: 'Math' });
    expect(syllabi).toHaveLength(2);
  });

  test('should find syllabi with no filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ tenantId, classGrade: '10' }) },
      ],
    });

    const syllabi = await repo.findWithFilters(tenantId);
    expect(syllabi).toHaveLength(1);
  });

  test('should soft delete a syllabus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId }),
    });

    await repo.softDelete('s1', tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted: true })
    );
  });

  test('should throw when soft deleting unauthorized syllabus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.softDelete('s1', tenantId)
    ).rejects.toThrow('Syllabus not found or unauthorized');
  });

  test('should update syllabus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId, title: 'Old Syllabus' }),
    });

    await repo.updateSyllabus('s1', tenantId, { title: 'New Syllabus' });
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Syllabus' })
    );
  });

  test('should throw when updating unauthorized syllabus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.updateSyllabus('s1', tenantId, { title: 'New Syllabus' })
    ).rejects.toThrow('Syllabus not found or unauthorized');
  });

  test('should find syllabus by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId, title: 'Algebra' }),
    });

    const syllabus = await repo.findById('s1', tenantId);
    expect(syllabus).not.toBeNull();
    expect(syllabus!.title).toBe('Algebra');
  });

  test('should create a syllabus', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'syllabus-123' });

    const data = { title: 'Algebra', classGrade: '10' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('syllabus-123');
  });

  test('should update a syllabus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId, title: 'Old' }),
    });

    await repo.update('s1', { title: 'Updated' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated' })
    );
  });

  test('should delete a syllabus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId }),
    });

    await repo.delete('s1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 's1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('s1', { title: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all syllabi', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ tenantId }) },
      ],
    });

    const syllabi = await repo.findAll(tenantId);
    expect(syllabi).toHaveLength(1);
  });

  test('should paginate syllabi', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ tenantId }) },
        { id: 's2', data: () => ({ tenantId }) },
        { id: 's3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count syllabi', async () => {
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

    const exists = await repo.exists('s1', tenantId);
    expect(exists).toBe(true);
  });
});