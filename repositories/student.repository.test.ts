// __tests__/student.repository.test.ts
import { StudentRepository } from '@/repositories/student.repository';
import { adminDb } from '@/lib/firebase-admin';

// Note: requires Firebase Emulator or test project setup
describe('StudentRepository', () => {
  const repo = new StudentRepository();
  const tenantId = 'test-tenant';

  beforeAll(async () => {
    // Clear test data
    const snapshot = await adminDb
      .collection('students')
      .where('tenantId', '==', tenantId)
      .get();
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  });

  test('should create and retrieve a student', async () => {
    const data = {
      fullName: 'Test Student',
      classGrade: '10',
      section: 'A',
      rollNumber: 1,
      tenantId,
    };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBeDefined();

    const student = await repo.findById(id, tenantId);
    expect(student).not.toBeNull();
    expect(student!.fullName).toBe('Test Student');
  });

  test('should paginate students', async () => {
    // Create 5 students
    for (let i = 0; i < 5; i++) {
      await repo.create({
        fullName: `Student ${i}`,
        classGrade: '9',
        section: 'B',
        rollNumber: i,
        tenantId,
      } as any, tenantId);
    }

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data.length).toBe(3);
    expect(result.total).toBeGreaterThanOrEqual(5);
    expect(result.totalPages).toBeGreaterThanOrEqual(2);
  });
});
