import { QuizRepository } from '@/repositories/quiz.repository';

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

describe('QuizRepository', () => {
  let repo: QuizRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new QuizRepository();
  });

  test('should create a quiz', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const quizCollection = adminDb.collection('quizzes');
    quizCollection.add.mockResolvedValue({ id: 'quiz-123' });

    const data = {
      title: 'Math Quiz',
      classGrade: '10',
      subject: 'Mathematics',
      questions: [],
    } as any;
    const id = await repo.create(data, tenantId);
    expect(id).toBe('quiz-123');
    expect(quizCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
      })
    );
  });

  test('should find quiz by id', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const quizDoc = adminDb.collection('quizzes').doc('quiz-456');
    quizDoc.get.mockResolvedValue({
      exists: true,
      id: 'quiz-456',
      data: () => ({
        title: 'Math Quiz',
        classGrade: '10',
        subject: 'Mathematics',
        tenantId,
      }),
    });

    const quiz = await repo.findById('quiz-456', tenantId);
    expect(quiz).not.toBeNull();
    expect(quiz!.title).toBe('Math Quiz');
  });

  test('should return null for non-existent quiz', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const quizDoc = adminDb.collection('quizzes').doc('nonexistent');
    quizDoc.get.mockResolvedValue({ exists: false, data: () => null });

    const quiz = await repo.findById('nonexistent', tenantId);
    expect(quiz).toBeNull();
  });

  test('should find all quizzes for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'q1', data: () => ({ title: 'Math Quiz', classGrade: '10', tenantId }) },
        { id: 'q2', data: () => ({ title: 'Science Quiz', classGrade: '9', tenantId }) },
      ],
    });

    const quizzes = await repo.findAll(tenantId);
    expect(quizzes).toHaveLength(2);
    expect(quizzes[0].title).toBe('Math Quiz');
  });

  test('should update a quiz', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const quizDoc = adminDb.collection('quizzes').doc('quiz-789');
    quizDoc.get.mockResolvedValue({
      exists: true,
      id: 'quiz-789',
      data: () => ({ title: 'Old Title', tenantId }),
    });

    await repo.update('quiz-789', { title: 'Updated Title' }, tenantId);
    expect(quizDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated Title' })
    );
  });

  test('should delete a quiz', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const quizDoc = adminDb.collection('quizzes').doc('quiz-999');
    quizDoc.get.mockResolvedValue({
      exists: true,
      id: 'quiz-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('quiz-999', tenantId);
    expect(quizDoc.delete).toHaveBeenCalled();
  });

  test('should find submissions by quiz', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'sub1', data: () => ({ quizId: 'quiz-1', tenantId, correct: 8, total: 10, percentage: 80 }) },
        { id: 'sub2', data: () => ({ quizId: 'quiz-1', tenantId, correct: 9, total: 10, percentage: 90 }) },
      ],
    });

    const submissions = await repo.findSubmissionsByQuiz('quiz-1', tenantId);
    expect(submissions).toHaveLength(2);
    expect(submissions[0].correct).toBe(8);
  });

  test('should create a submission', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const subCollection = adminDb.collection('quiz_submissions');
    subCollection.add.mockResolvedValue({ id: 'submission-123' });

    const data = {
      quizId: 'quiz-1',
      studentId: 'student-1',
      answers: [{ questionId: 'q1', answer: 'A' }],
      score: 85,
    } as any;
    const id = await repo.createSubmission(data, tenantId);
    expect(id).toBe('submission-123');
    expect(subCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        quizId: 'quiz-1',
        createdAt: expect.any(String),
      })
    );
  });

  test('should count quizzes', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 12 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(12);
  });

  test('should paginate quizzes', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'q1', data: () => ({ title: 'Math Quiz', tenantId }) },
        { id: 'q2', data: () => ({ title: 'Science Quiz', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });
});
