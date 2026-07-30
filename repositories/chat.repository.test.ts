import { ChatRepository } from '@/repositories/chat.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('ChatRepository', () => {
  let repo: ChatRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ChatRepository();
  });

  test('should create a message and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'msg-123' });

    const data = { teacherId: 't1', parentId: 'p1', text: 'Hello', senderRole: 'teacher', senderUid: 'u1', tenantId };
    const id = await repo.createMessage(data);
    expect(id).toBe('msg-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        teacherId: 't1',
        tenantId,
      })
    );
  });

  test('should find messages by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, teacherId: 't1', text: 'Hello' }) },
        { id: 'm2', data: () => ({ tenantId, teacherId: 't1', text: 'Hi' }) },
      ],
    });

    const messages = await repo.findByTenant(tenantId, 't1');
    expect(messages).toHaveLength(2);
  });

  test('should find messages by tenant with parentId filter', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, parentId: 'p1', text: 'Hello' }) },
      ],
    });

    const messages = await repo.findByTenant(tenantId, undefined, 'p1');
    expect(messages).toHaveLength(1);
  });

  test('should find messages by tenant with teacherId and parentId filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, teacherId: 't1', parentId: 'p1', text: 'Hello' }) },
      ],
    });

    const messages = await repo.findByTenant(tenantId, 't1', 'p1');
    expect(messages).toHaveLength(1);
  });

  test('should find messages by tenant with limit', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId, text: 'Hello' }) },
      ],
    });

    const messages = await repo.findByTenant(tenantId, undefined, undefined, 10);
    expect(messages).toHaveLength(1);
  });
});