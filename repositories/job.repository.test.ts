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
  const makeDoc = () => ({
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
    collection: jest.fn(() => makeCollection()),
  });
  const makeCollection = () => ({
    add: jest.fn().mockResolvedValue({ id: 'added-id' }),
    doc: jest.fn().mockReturnValue(makeDoc()),
    where: jest.fn().mockReturnValue(mockQuery),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  });
  const mockDocRef = makeDoc();
  const mockCollection = makeCollection();
  const mockBatch = {
    delete: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };
  return {
    adminDb: {
      collection: jest.fn(() => makeCollection()),
      batch: jest.fn().mockReturnValue(mockBatch),
    },
    dbTimestamp: new Date().toISOString(),
    mockDocRef,
    mockQuery,
    mockCollection,
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
        tenantId,
      })
    );
  });

  test('should find job by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
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
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const job = await repo.findById(tenantId, 'nonexistent');
    expect(job).toBeNull();
  });

  test('should update progress', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'job-789',
      data: () => ({ tenantId }),
    });

    await repo.updateProgress(tenantId, 'job-789', 50, 100, 'processing');
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processedItems: 50,
        progress: 50,
        status: 'processing',
      })
    );
  });

  test('should update progress to completed', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'job-789',
      data: () => ({ tenantId }),
    });

    await repo.updateProgress(tenantId, 'job-789', 100, 100, 'completed');
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processedItems: 100,
        progress: 100,
        status: 'completed',
        finishedAt: expect.any(String),
      })
    );
  });

  test('should fail job', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'job-999',
      data: () => ({ tenantId }),
    });

    await repo.failJob(tenantId, 'job-999', 'Error occurred');
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        error: 'Error occurred',
      })
    );
  });
});
