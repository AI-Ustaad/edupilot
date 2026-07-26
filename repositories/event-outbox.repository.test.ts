import { EventOutboxRepository } from '@/repositories/event-outbox.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
    }),
  };
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'event-123' }),
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
      runTransaction: jest.fn().mockImplementation((fn) => fn(mockDocRef)),
    },
    dbTimestamp: new Date().toISOString(),
    mockDocRef,
    mockQuery,
    mockCollection,
    mockBatch,
  };
});

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-123'),
}));

describe('EventOutboxRepository', () => {
  let repo: EventOutboxRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new EventOutboxRepository();
  });

  test('should enqueue an event and return id', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    adminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    });

    const eventId = await repo.enqueue('student.created', { tenantId, studentId: 's1' });
    expect(eventId).toBe('uuid-123');
  });

  test('should throw enqueue without tenantId', async () => {
    await expect(
      repo.enqueue('student.created', { studentId: 's1' })
    ).rejects.toThrow('Durable event student.created requires a tenantId');
  });

  test('should complete an event', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const mockEventDoc = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    adminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockEventDoc),
    });

    await repo.complete('event-1', 'worker-1');
    expect(mockEventDoc.update).toHaveBeenCalled();
  });

  test('should claim a subscriber', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    adminDb.runTransaction.mockResolvedValue(true);

    const result = await repo.claimSubscriber('event-1', 'sub-1');
    expect(typeof result).toBe('boolean');
  });

  test('should complete a subscriber', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const mockSubDoc = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    adminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockSubDoc),
    });

    await repo.completeSubscriber('event-1', 'sub-1');
    expect(mockSubDoc.update).toHaveBeenCalled();
  });

  test('should release a subscriber', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const mockSubDoc = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    adminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockSubDoc),
    });

    await repo.releaseSubscriber('event-1', 'sub-1');
    expect(mockSubDoc.delete).toHaveBeenCalled();
  });
});