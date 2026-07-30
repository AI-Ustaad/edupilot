import { EventOutboxRepository } from '@/repositories/event-outbox.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-123'),
}));

describe('EventOutboxRepository', () => {
  let repo: EventOutboxRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    const { adminDb, mockCollection, mockDocRef, mockQuery } = require('@/lib/firebase-admin');
    adminDb.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockCollection.where.mockReturnValue(mockQuery);
    repo = new EventOutboxRepository();
  });

  test('should enqueue an event and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'uuid-123' });

    const eventId = await repo.enqueue('student.created', { tenantId, studentId: 's1' });
    expect(eventId).toBe('uuid-123');
  });

  test('should throw enqueue without tenantId', async () => {
    await expect(
      repo.enqueue('student.created', { studentId: 's1' })
    ).rejects.toThrow('Durable event student.created requires a tenantId');
  });

  test('should complete an event', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.update.mockResolvedValue(undefined);

    await repo.complete('event-1', 'worker-1');
    expect(mockDocRef.update).toHaveBeenCalled();
  });

  test('should claim a subscriber', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    adminDb.runTransaction.mockResolvedValue(true);

    const result = await repo.claimSubscriber('event-1', 'sub-1');
    expect(typeof result).toBe('boolean');
  });

  test('should complete a subscriber', async () => {
    const { adminDb, mockCollection, mockDocRef } = require('@/lib/firebase-admin');
    const mockSubDoc = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection.doc.mockReturnValue(mockSubDoc);

    await repo.completeSubscriber('event-1', 'sub-1');
    expect(mockSubDoc.update).toHaveBeenCalled();
  });

  test('should release a subscriber', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    const mockSubDoc = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection.doc.mockReturnValue(mockSubDoc);

    await repo.releaseSubscriber('event-1', 'sub-1');
    expect(mockSubDoc.delete).toHaveBeenCalled();
  });
});
