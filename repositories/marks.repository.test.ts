import { MarksRepository } from '@/repositories/marks.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'mark-123' }),
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

describe('MarksRepository', () => {
  let repo: MarksRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new MarksRepository();
  });

  test('should find marks with filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, studentId: 's1', classGrade: '10', term: 'Q1', subject: 'Math', deleted: false }) },
        { id: 'm2', data: () => ({ tenantId, studentId: 's2', classGrade: '10', term: 'Q1', subject: 'Math', deleted: false }) },
      ],
    });

    const marks = await repo.findWithFilters(tenantId, { classGrade: '10', term: 'Q1', subject: 'Math' });
    expect(marks).toHaveLength(2);
  });

  test('should find marks with no filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, studentId: 's1', deleted: false }) },
      ],
    });

    const marks = await repo.findWithFilters(tenantId);
    expect(marks).toHaveLength(1);
  });

  test('should find marks by student', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, studentId: 's1', deleted: false }) },
      ],
    });

    const marks = await repo.findByStudent(tenantId, 's1');
    expect(marks).toHaveLength(1);
  });

  test('should find skills', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, studentId: 's1', term: 'Q1', skills: { math: 85, english: 90 } }) },
        { id: 'm2', data: () => ({ tenantId, studentId: 's1', term: 'Q1', skills: { science: 78 } }) },
      ],
    });

    const skills = await repo.findSkills(tenantId, 's1', 'Q1');
    expect(skills).toHaveLength(2);
  });

  test('should find skills with no term filter', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, studentId: 's1', skills: { math: 85 } }) },
      ],
    });

    const skills = await repo.findSkills(tenantId, 's1');
    expect(skills).toHaveLength(1);
  });

  test('should upsert a mark', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId }),
    });

    await repo.upsert('m1', { studentId: 's1', marksObtained: 95 }, tenantId);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 's1', marksObtained: 95 }),
      { merge: true }
    );
  });

  test('should soft delete a mark', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId }),
    });

    await repo.softDeleteMark('m1', tenantId, 'user-1');
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted: true, deletedBy: 'user-1' })
    );
  });

  test('should throw when soft deleting unauthorized mark', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.softDeleteMark('m1', tenantId, 'user-1')
    ).rejects.toThrow('Mark not found or access denied');
  });

  test('should find mark by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId, studentId: 's1' }),
    });

    const mark = await repo.findById('m1', tenantId);
    expect(mark).not.toBeNull();
  });

  test('should create a mark', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'mark-123' });

    const data = { studentId: 's1', marksObtained: 95 };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('mark-123');
  });

  test('should update a mark', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId, marksObtained: 80 }),
    });

    await repo.update('m1', { marksObtained: 95 }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ marksObtained: 95 })
    );
  });

  test('should delete a mark', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId }),
    });

    await repo.delete('m1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'm1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('m1', { marksObtained: 95 }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all marks', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId }) },
      ],
    });

    const marks = await repo.findAll(tenantId);
    expect(marks).toHaveLength(1);
  });

  test('should paginate marks', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId }) },
        { id: 'm2', data: () => ({ tenantId }) },
        { id: 'm3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count marks', async () => {
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

    const exists = await repo.exists('m1', tenantId);
    expect(exists).toBe(true);
  });
});