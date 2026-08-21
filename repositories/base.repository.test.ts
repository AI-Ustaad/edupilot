import { BaseRepository } from '@/repositories/base.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
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

  test('should set document with deterministic id', async () => {
    const { adminDb, mockCollection, mockDocRef } = require('@/lib/firebase-admin');
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockDocRef.set.mockResolvedValue(undefined);

    await repo.setWithId('det-1', { name: 'Deterministic' } as any, tenantId);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Deterministic',
        tenantId,
      }),
      { merge: true }
    );
  });

  test('should bulk set documents with deterministic ids', async () => {
    const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
    mockBatch.commit.mockResolvedValue(undefined);

    const mockDocRef1 = { id: 'det-1', set: jest.fn().mockResolvedValue(undefined) };
    const mockDocRef2 = { id: 'det-2', set: jest.fn().mockResolvedValue(undefined) };
    mockCollection.doc.mockImplementation((id: string) => {
      if (id === 'det-1') return mockDocRef1;
      if (id === 'det-2') return mockDocRef2;
      return { id: 'default', set: jest.fn().mockResolvedValue(undefined) };
    });

    const entries = [
      { id: 'det-1', data: { name: 'Doc 1' } },
      { id: 'det-2', data: { name: 'Doc 2' } },
    ];
    await repo.bulkSetWithIds(entries as any, tenantId);
    expect(mockBatch.set).toHaveBeenCalledTimes(2);
    expect(mockBatch.set).toHaveBeenNthCalledWith(1, mockDocRef1, expect.objectContaining({ name: 'Doc 1', tenantId }), { merge: true });
    expect(mockBatch.set).toHaveBeenNthCalledWith(2, mockDocRef2, expect.objectContaining({ name: 'Doc 2', tenantId }), { merge: true });
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  describe('bulkSetWithIds batching', () => {
    const makeEntries = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ id: `key-${i}`, data: { name: `Doc ${i}` } }));

    async function run(n: number) {
      const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
      mockBatch.set.mockClear();
      mockBatch.commit.mockClear();
      mockCollection.doc.mockClear();
      mockCollection.doc.mockReturnValue({ id: 'any', set: jest.fn(), get: jest.fn() });
      adminDb.batch.mockClear();
      adminDb.batch.mockReturnValue(mockBatch);
      await repo.bulkSetWithIds(makeEntries(n) as any, tenantId);
      return { mockBatch, mockCollection };
    }

    test('499 entries → 1 batch', async () => {
      const { mockBatch } = await run(499);
      expect(mockBatch.set).toHaveBeenCalledTimes(499);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    test('500 entries → 1 batch', async () => {
      const { mockBatch } = await run(500);
      expect(mockBatch.set).toHaveBeenCalledTimes(500);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    test('501 entries → 2 batches', async () => {
      const { mockBatch } = await run(501);
      expect(mockBatch.set).toHaveBeenCalledTimes(501);
      expect(mockBatch.commit).toHaveBeenCalledTimes(2);
    });

    test('1000 entries → 2 batches', async () => {
      const { mockBatch } = await run(1000);
      expect(mockBatch.set).toHaveBeenCalledTimes(1000);
      expect(mockBatch.commit).toHaveBeenCalledTimes(2);
    });

    test('empty entries → no batches, no commits', async () => {
      const { mockBatch } = await run(0);
      expect(mockBatch.set).not.toHaveBeenCalled();
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });

    test('merge semantics and deterministic ids are preserved across batches', async () => {
      const { mockBatch, mockCollection } = await run(501);
      // First entry of first batch and first entry of second batch both written with merge:true
      expect(mockBatch.set).toHaveBeenNthCalledWith(1, expect.anything(), expect.objectContaining({ name: 'Doc 0', tenantId }), { merge: true });
      expect(mockBatch.set).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ name: 'Doc 500', tenantId }), { merge: true });
      // Each entry maps to a deterministic doc id
      expect(mockCollection.doc).toHaveBeenCalledWith('key-0');
      expect(mockCollection.doc).toHaveBeenCalledWith('key-500');
      expect(mockCollection.doc).toHaveBeenCalledTimes(501);
    });

    test('tenant id is injected into every entry', async () => {
      const { mockBatch } = await run(600);
      mockBatch.set.mock.calls.forEach((call: any[]) => {
        expect(call[1]).toEqual(expect.objectContaining({ tenantId }));
        expect(call[2]).toEqual({ merge: true });
      });
    });

    test('propagates batch commit failure', async () => {
      const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
      mockCollection.doc.mockReturnValue({ id: 'any', set: jest.fn() });
      const failingBatch = {
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error('batch failed')),
      };
      adminDb.batch.mockReturnValue(failingBatch);
      await expect(repo.bulkSetWithIds(makeEntries(3) as any, tenantId)).rejects.toThrow('batch failed');
    });
  });
});
