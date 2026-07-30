import { BookRepository } from '@/repositories/book.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('BookRepository', () => {
  let repo: BookRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BookRepository();
  });

  test('should create a book and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'book-123' });

    const data = {
      title: 'Math Book',
      author: 'John Doe',
      classGrade: '10',
      subject: 'Mathematics',
    };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('book-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Math Book',
        tenantId,
      })
    );
  });

  test('should find book by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'book-456',
      data: () => ({
        title: 'Math Book',
        author: 'John Doe',
        classGrade: '10',
        subject: 'Mathematics',
        tenantId,
      }),
    });

    const book = await repo.findById('book-456', tenantId);
    expect(book).not.toBeNull();
    expect(book!.title).toBe('Math Book');
  });

  test('should return null for non-existent book', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const book = await repo.findById('nonexistent', tenantId);
    expect(book).toBeNull();
  });

  test('should update a book', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'book-789',
      data: () => ({ title: 'Old Title', tenantId }),
    });

    await repo.update('book-789', { title: 'Updated Title' } as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated Title' })
    );
  });

  test('should delete a book', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'book-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('book-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'book-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('book-789', { title: 'Updated' } as any, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all books for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ title: 'Book 1', tenantId }) },
        { id: 'b2', data: () => ({ title: 'Book 2', tenantId }) },
      ],
    });

    const books = await repo.findAll(tenantId);
    expect(books).toHaveLength(2);
    expect(books[0].title).toBe('Book 1');
  });

  test('should paginate books', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ title: 'Book 1', tenantId }) },
        { id: 'b2', data: () => ({ title: 'Book 2', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  test('should count books', async () => {
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

    const exists = await repo.exists('book-1', tenantId);
    expect(exists).toBe(true);
  });

  test('should findByFilter with classGrade', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ title: 'Math Book', classGrade: '10', subject: 'Mathematics', tenantId }) },
      ],
    });

    const books = await repo.findByFilter(tenantId, { classGrade: '10' });
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('Math Book');
  });

  test('should findByFilter with subject', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ title: 'Math Book', classGrade: '10', subject: 'Mathematics', tenantId }) },
      ],
    });

    const books = await repo.findByFilter(tenantId, { subject: 'Mathematics' });
    expect(books).toHaveLength(1);
    expect(books[0].subject).toBe('Mathematics');
  });

  test('should findByFilter with both filters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ title: 'Math Book', classGrade: '10', subject: 'Mathematics', tenantId }) },
      ],
    });

    const books = await repo.findByFilter(tenantId, { classGrade: '10', subject: 'Mathematics' });
    expect(books).toHaveLength(1);
  });
});
