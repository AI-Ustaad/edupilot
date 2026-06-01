import { StudentRepository } from './student.repository';

// Mock the Firebase Admin module
jest.mock('@/lib/firebase-admin', () => {
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'mock-id',
          data: () => ({
            fullName: 'Test Student',
            classGrade: '10',
            section: 'A',
            rollNumber: 1,
            tenantId: 'test-tenant',
          }),
        },
      ],
    }),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { count: 5 } }),
    }),
  };

  const mockFirestore = {
    collection: jest.fn().mockReturnValue(mockCollection),
    batch: jest.fn(() => ({
      set: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    })),
  };

  return {
    adminDb: mockFirestore,
    dbTimestamp: jest.fn(),
  };
});

describe('StudentRepository', () => {
  const repo = new StudentRepository();
  const tenantId = 'test-tenant';

  test('create returns a string id', async () => {
    const id = await repo.create({
      fullName: 'Test',
      classGrade: '10',
      section: 'A',
      rollNumber: 1,
      tenantId,
    } as any, tenantId);
    expect(typeof id).toBe('string');
  });

  test('findById returns a student', async () => {
    const student = await repo.findById('mock-id', tenantId);
    expect(student).not.toBeNull();
    expect(student?.fullName).toBe('Test Student');
  });

  test('paginate returns paginated results', async () => {
    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBeGreaterThanOrEqual(2);
  });
});
