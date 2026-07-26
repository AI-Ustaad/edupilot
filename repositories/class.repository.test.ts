import { ClassRepository } from '@/repositories/class.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'class-123' }),
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

describe('ClassRepository', () => {
  let repo: ClassRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ClassRepository();
  });

  test('should create a class and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'class-123' });

    const data = { classGrade: '10', sectionName: 'A' };
    const id = await repo.createClass(data, tenantId);
    expect(id).toBe('class-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        classGrade: '10',
        sectionName: 'A',
        tenantId,
      })
    );
  });

  test('should get all classes for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'c1', data: () => ({ tenantId, classGrade: '10', sectionName: 'A', deleted: false }) },
        { id: 'c2', data: () => ({ tenantId, classGrade: '10', sectionName: 'B', deleted: true }) },
      ],
    });

    const classes = await repo.getAll(tenantId);
    expect(classes).toHaveLength(1);
    expect(classes[0].sectionName).toBe('A');
  });

  test('should soft delete a class', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'c1',
      data: () => ({ tenantId }),
    });

    await repo.deleteClass('c1', tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted: true })
    );
  });

  test('should find class by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'c1',
      data: () => ({ classGrade: '10', tenantId }),
    });

    const cls = await repo.findById('c1', tenantId);
    expect(cls).not.toBeNull();
    expect(cls!.classGrade).toBe('10');
  });

  test('should return null for non-existent class', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const cls = await repo.findById('nonexistent', tenantId);
    expect(cls).toBeNull();
  });

  test('should update a class', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'c1',
      data: () => ({ classGrade: '10', tenantId }),
    });

    await repo.update('c1', { classGrade: '11' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ classGrade: '11' })
    );
  });

  test('should delete a class', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'c1',
      data: () => ({ tenantId }),
    });

    await repo.delete('c1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'c1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('c1', { classGrade: '11' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all classes', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'c1', data: () => ({ tenantId }) },
      ],
    });

    const classes = await repo.findAll(tenantId);
    expect(classes).toHaveLength(1);
  });

  test('should paginate classes', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'c1', data: () => ({ tenantId }) },
        { id: 'c2', data: () => ({ tenantId }) },
        { id: 'c3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count classes', async () => {
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

    const exists = await repo.exists('c1', tenantId);
    expect(exists).toBe(true);
  });
});