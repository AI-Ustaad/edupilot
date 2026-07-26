import { ChatRepository } from '@/repositories/chat.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'msg-123' }),
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

  test('should paginate messages', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ tenantId }) },
        { id: 'm2', data: () => ({ tenantId }) },
        { id: 'm3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count messages', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 20 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(20);
  });
});