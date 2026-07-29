import { JobRepository } from '@/repositories/job.repository';

jest.mock('@/lib/firebase-admin', () => {
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

  // Stable memoized mocks
  const collectionCache = new Map();
  const docCache = new Map();

  const makeDoc = (fullPath: string) => {
    if (docCache.has(fullPath)) {
      return docCache.get(fullPath);
    }

    const doc = {
      get: jest.fn().mockResolvedValue({ exists: false, data: () => undefined }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      id: fullPath.split('/').pop() || 'mock-doc-id',
      collection: jest.fn((subCollectionName: string) => {
        return makeCollection(fullPath + '/' + subCollectionName);
      }),
    };

    docCache.set(fullPath, doc);
    return doc;
  };

  const makeCollection = (path: string) => {
    if (collectionCache.has(path)) {
      return collectionCache.get(path);
    }

    const collection = {
      add: jest.fn().mockResolvedValue({ id: 'added-id' }),
      doc: jest.fn((docId?: string) => {
        const id = docId || 'mock-doc-id';
        return makeDoc(path + '/' + id);
      }),
      where: jest.fn().mockReturnValue(mockQuery),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    };

    collectionCache.set(path, collection);
    return collection;
  };

  const mockBatch = {
    delete: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };

  return {
    adminDb: {
      collection: jest.fn((name: string) => makeCollection(name)),
      batch: jest.fn().mockReturnValue(mockBatch),
    },
    dbTimestamp: new Date().toISOString(),
    mockQuery,
    mockBatch,
  };
});

describe('JobRepository', () => {
  let repo: JobRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new JobRepository();
  });

  test('should create a job and return id', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const mockAddedId = 'job-123';
    const targetCollection = adminDb.collection('tenants').doc(tenantId).collection('jobs');
    targetCollection.add.mockResolvedValue({ id: mockAddedId });

    const data = {
      type: 'import',
      status: 'pending' as const,
      progress: 0,
      totalItems: 100,
      processedItems: 0,
      createdBy: 'user-1',
    };
    const id = await repo.create(data, tenantId);
    expect(id).toBe(mockAddedId);
    expect(targetCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'import',
        createdBy: 'user-1',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    );
  });

  test('should find job by id', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-456');
    jobDoc.get.mockResolvedValue({
      exists: true,
      id: 'job-456',
      data: () => ({
        type: 'import',
        status: 'processing',
        progress: 50,
        totalItems: 100,
        processedItems: 50,
        createdBy: 'user-1',
        tenantId,
      }),
    });

    const job = await repo.findById(tenantId, 'job-456');
    expect(job).not.toBeNull();
    expect(job!.type).toBe('import');
  });

  test('should return null for non-existent job', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('nonexistent');
    jobDoc.get.mockResolvedValue({ exists: false, data: () => null });

    const job = await repo.findById(tenantId, 'nonexistent');
    expect(job).toBeNull();
  });

  test('should update progress', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-789');
    jobDoc.get.mockResolvedValue({
      exists: true,
      id: 'job-789',
      data: () => ({ tenantId }),
    });

    await repo.updateProgress(tenantId, 'job-789', 50, 100, 'processing');
    expect(jobDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processedItems: 50,
        progress: 50,
        status: 'processing',
      })
    );
  });

  test('should update progress to completed', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-789');
    jobDoc.get.mockResolvedValue({
      exists: true,
      id: 'job-789',
      data: () => ({ tenantId }),
    });

    await repo.updateProgress(tenantId, 'job-789', 100, 100, 'completed');
    expect(jobDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processedItems: 100,
        progress: 100,
        status: 'completed',
        finishedAt: expect.any(String),
      })
    );
  });

  test('should fail job', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-999');
    jobDoc.get.mockResolvedValue({
      exists: true,
      id: 'job-999',
      data: () => ({ tenantId }),
    });

    await repo.failJob(tenantId, 'job-999', 'Error occurred');
    expect(jobDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        error: 'Error occurred',
      })
    );
  });
});
