import { ParentsRepository } from '@/repositories/parents.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'parent-123' }),
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

describe('ParentsRepository', () => {
  let repo: ParentsRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ParentsRepository();
  });

  test('should save parent document (update existing)', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'p1',
      data: () => ({ tenantId }),
    });

    const document = { id: 'p1', tenantId, name: 'John Parent' };
    await repo.save(document, tenantId);
    expect(mockDocRef.update).toHaveBeenCalled();
  });

  test('should save parent document (create new)', async () => {
    const { mockCollection, mockDocRef } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'parent-123' });
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const document = { name: 'John Parent', tenantId };
    await repo.save(document as any, tenantId);
    expect(mockCollection.add).toHaveBeenCalled();
  });

  test('should find parent by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'p1',
      data: () => ({ tenantId, name: 'John Parent' }),
    });

    const parent = await repo.findById('p1', tenantId);
    expect(parent).not.toBeNull();
    expect(parent!.name).toBe('John Parent');
  });

  test('should return null for non-existent parent', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const parent = await repo.findById('nonexistent', tenantId);
    expect(parent).toBeNull();
  });

  test('should create a parent', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'parent-123' });

    const data = { name: 'John Parent', studentId: 's1' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('parent-123');
  });

  test('should update a parent', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'p1',
      data: () => ({ tenantId, name: 'Old Name' }),
    });

    await repo.update('p1', { name: 'Updated Name' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
  });

  test('should delete a parent', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'p1',
      data: () => ({ tenantId }),
    });

    await repo.delete('p1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'p1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('p1', { name: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all parents', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'p1', data: () => ({ tenantId }) },
      ],
    });

    const parents = await repo.findAll(tenantId);
    expect(parents).toHaveLength(1);
  });

  test('should paginate parents', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'p1', data: () => ({ tenantId }) },
        { id: 'p2', data: () => ({ tenantId }) },
        { id: 'p3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count parents', async () => {
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

    const exists = await repo.exists('p1', tenantId);
    expect(exists).toBe(true);
  });
});