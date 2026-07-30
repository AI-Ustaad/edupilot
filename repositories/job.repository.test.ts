import { JobRepository } from '@/repositories/job.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
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
