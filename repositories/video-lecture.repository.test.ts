import { VideoLectureRepository } from '@/repositories/video-lecture.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'lecture-123' }),
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

describe('VideoLectureRepository', () => {
  let repo: VideoLectureRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new VideoLectureRepository();
  });

  test('should find video lecture by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'v1',
      data: () => ({ tenantId, title: 'Intro to Math' }),
    });

    const lecture = await repo.findById('v1', tenantId);
    expect(lecture).not.toBeNull();
    expect(lecture!.title).toBe('Intro to Math');
  });

  test('should return null for non-existent video lecture', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const lecture = await repo.findById('nonexistent', tenantId);
    expect(lecture).toBeNull();
  });

  test('should create a video lecture', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'lecture-123' });

    const data = { title: 'Intro to Math', videoUrl: 'https://example.com/video' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('lecture-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Intro to Math',
        tenantId,
      })
    );
  });

  test('should update a video lecture', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'v1',
      data: () => ({ tenantId, title: 'Old Title' }),
    });

    await repo.update('v1', { title: 'New Title' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Title' })
    );
  });

  test('should delete a video lecture', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'v1',
      data: () => ({ tenantId }),
    });

    await repo.delete('v1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'v1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('v1', { title: 'New Title' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all video lectures', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'v1', data: () => ({ tenantId }) },
      ],
    });

    const lectures = await repo.findAll(tenantId);
    expect(lectures).toHaveLength(1);
  });

  test('should paginate video lectures', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'v1', data: () => ({ tenantId }) },
        { id: 'v2', data: () => ({ tenantId }) },
        { id: 'v3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count video lectures', async () => {
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

    const exists = await repo.exists('v1', tenantId);
    expect(exists).toBe(true);
  });
});