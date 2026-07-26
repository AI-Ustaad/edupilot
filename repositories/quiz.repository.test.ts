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

describe('QuizRepository', () => {
  let repo: QuizRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new QuizRepository();
  });

  test('should create a quiz', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'quiz-123' });

    const data = {
      title: 'Math Quiz',
      classGrade: '10',
      subject: 'Mathematics',
      questions: [],
    } as any;
    const id = await repo.create(data, tenantId);
    expect(id).toBe('quiz-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
      })
    );
  });

  test('should find quiz by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
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
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

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
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'quiz-789',
      data: () => ({ title: 'Old Title', tenantId }),
    });

    await repo.update('quiz-789', { title: 'Updated Title' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated Title' })
    );
  });

  test('should delete a quiz', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'quiz-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('quiz-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should find submissions by quiz', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const submissionsCollection = adminDb.collection('quiz_submissions');
    submissionsCollection.orderBy('createdAt', 'desc').get.mockResolvedValue({
      docs: [
        { id: 'sub1', data: () => ({ quizId: 'quiz-1', tenantId, score: 85 }) },
        { id: 'sub2', data: () => ({ quizId: 'quiz-1', tenantId, score: 90 }) },
      ],
    });

    const submissions = await repo.findSubmissionsByQuiz('quiz-1', tenantId);
    expect(submissions).toHaveLength(2);
    expect(submissions[0].score).toBe(85);
  });

  test('should create a submission', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'submission-123' });

    const data = {
      quizId: 'quiz-1',
      studentId: 'student-1',
      answers: [{ questionId: 'q1', answer: 'A' }],
      score: 85,
    } as any;
    const id = await repo.createSubmission(data, tenantId);
    expect(id).toBe('submission-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
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
