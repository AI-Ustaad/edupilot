import { AssignmentRepository } from '@/repositories/assignment.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('AssignmentRepository', () => {
  let repo: AssignmentRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AssignmentRepository();
  });

  test('should create an assignment and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'assignment-123' });

    const data = {
      title: 'Math Assignment',
      classGrade: '10',
      section: 'A',
      dueDate: '2024-06-15',
    };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('assignment-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Math Assignment',
        tenantId,
      })
    );
  });

  test('should find assignment by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'assignment-456',
      data: () => ({
        title: 'Math Assignment',
        classGrade: '10',
        section: 'A',
        tenantId,
      }),
    });

    const assignment = await repo.findById('assignment-456', tenantId);
    expect(assignment).not.toBeNull();
    expect(assignment!.title).toBe('Math Assignment');
  });

  test('should return null for non-existent assignment', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const assignment = await repo.findById('nonexistent', tenantId);
    expect(assignment).toBeNull();
  });

  test('should update an assignment', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'assignment-789',
      data: () => ({ title: 'Old Title', tenantId }),
    });

    await repo.update('assignment-789', { title: 'Updated Title' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated Title' })
    );
  });

  test('should delete an assignment', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'assignment-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('assignment-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'assignment-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('assignment-789', { title: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all assignments for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ title: 'Assignment 1', tenantId }) },
        { id: 'a2', data: () => ({ title: 'Assignment 2', tenantId }) },
      ],
    });

    const assignments = await repo.findAll(tenantId);
    expect(assignments).toHaveLength(2);
    expect(assignments[0].title).toBe('Assignment 1');
  });

  test('should paginate assignments', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ title: 'Assignment 1', tenantId }) },
        { id: 'a2', data: () => ({ title: 'Assignment 2', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count assignments', async () => {
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

    const exists = await repo.exists('assignment-1', tenantId);
    expect(exists).toBe(true);
  });

  test('should find submissions by assignment', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ studentId: 'student-1', content: 'Submission 1', tenantId }) },
        { id: 's2', data: () => ({ studentId: 'student-2', content: 'Submission 2', tenantId }) },
      ],
    });

    const submissions = await repo.findSubmissionsByAssignment('assignment-1', tenantId);
    expect(submissions).toHaveLength(2);
    expect(submissions[0].studentId).toBe('student-1');
  });

  test('should create a submission and return id', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'submission-123' });

    const data = {
      tenantId,
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      studentName: 'John Doe',
      fileUrl: 'https://example.com/submission.pdf',
      fileName: 'submission.pdf',
      submittedBy: 'student-1',
    };
    const id = await repo.createSubmission(data, tenantId);
    expect(id).toBe('submission-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        assignmentId: 'assignment-1',
        studentId: 'student-1',
      })
    );
  });
});
