import { BaseRepository } from '@/repositories/base.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
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

describe('BaseRepository', () => {
  let repo: BaseRepository<any>;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BaseRepository('test-collection');
  });

  test('should create a document and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'doc-123' });

    const data = { name: 'Test', value: 42 };
    const id = await repo.create(data, tenantId);
    expect(id).toBe('doc-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test',
        value: 42,
        tenantId,
      })
    );
  });

  test('should find document by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-456',
      data: () => ({ name: 'Test', value: 42, tenantId }),
    });

    const doc = await repo.findById('doc-456', tenantId);
    expect(doc).not.toBeNull();
    expect(doc!.name).toBe('Test');
  });

  test('should return null for non-existent document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const doc = await repo.findById('nonexistent', tenantId);
    expect(doc).toBeNull();
  });

  test('should return null for unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-456',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    const doc = await repo.findById('doc-456', tenantId);
    expect(doc).toBeNull();
  });

  test('should update a document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-789',
      data: () => ({ name: 'Old Name', tenantId }),
    });

    await repo.update('doc-789', { name: 'Updated Name' } as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('doc-789', { name: 'Updated' } as any, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should delete a document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('doc-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when deleting unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-999',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.delete('doc-999', tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all documents for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'd1', data: () => ({ name: 'Doc 1', tenantId }) },
        { id: 'd2', data: () => ({ name: 'Doc 2', tenantId }) },
      ],
    });

    const docs = await repo.findAll(tenantId);
    expect(docs).toHaveLength(2);
    expect(docs[0].name).toBe('Doc 1');
  });

  test('should paginate documents', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'd1', data: () => ({ name: 'Doc 1', tenantId }) },
        { id: 'd2', data: () => ({ name: 'Doc 2', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  test('should count documents', async () => {
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

    const exists = await repo.exists('doc-1', tenantId);
    expect(exists).toBe(true);
  });

  test('should return false for non-existent document existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: false,
      data: () => null,
    });

    const exists = await repo.exists('nonexistent', tenantId);
    expect(exists).toBe(false);
  });

  test('should soft delete a document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-789',
      data: () => ({ name: 'Test', tenantId }),
    });

    await repo.softDelete('doc-789', tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: expect.anything() })
    );
  });

  test('should throw when soft deleting unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'doc-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.softDelete('doc-789', tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should bulk create documents', async () => {
    const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
    mockBatch.commit.mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({
      id: 'bulk-1',
    });

    const dataArray = [
      { name: 'Doc 1' },
      { name: 'Doc 2' },
    ];
    const ids = await repo.bulkCreate(dataArray as any, tenantId);
    expect(ids).toHaveLength(2);
    expect(mockBatch.set).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();
  });
});
