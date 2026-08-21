import { StudentService } from '@/services/StudentService';

describe('StudentService.student360', () => {
  test('derives the student graph from tenant-scoped attendance, fees, marks, behavior, and timeline data', async () => {
    const studentRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'student-1',
        tenantId: 'tenant-a',
        fullName: 'Ada Lovelace',
        classGrade: '10',
        section: 'A',
        metadata: {},
      }),
      timeline: jest.fn().mockResolvedValue([{ date: '2026-08-18', type: 'comment', title: 'Follow-up', description: 'Contacted guardian' }]),
    } as any;
    const sources = {
      attendance: {
        findByStudentId: jest.fn().mockResolvedValue([
          { status: 'Present' }, { status: 'Late' }, { status: 'Absent' },
        ]),
      },
      fees: {
        findByStudent: jest.fn().mockResolvedValue([
          { id: 'fee-1', amountPaid: 5000, status: 'paid' },
          { id: 'fee-2', amountPaid: 2000, status: 'pending' },
        ]),
      },
      marks: {
        findByStudent: jest.fn().mockResolvedValue([
          { id: 'mark-1', marksObtained: 80, totalMarks: 100 },
          { id: 'mark-2', percentage: 60, marksObtained: 30, totalMarks: 50 },
        ]),
      },
      behavior: {
        findByStudent: jest.fn().mockResolvedValue([{ id: 'behavior-1', points: -2 }, { id: 'behavior-2', points: 3 }]),
      },
    };
    const service = new StudentService(studentRepository, sources as any);

    const aggregate = await service.student360('tenant-a', 'student-1');

    expect(aggregate).toEqual(expect.objectContaining({
      attendance: { present: 2, absent: 1, late: 1, percentage: 67 },
      fees: expect.objectContaining({ totalDue: 7000, totalPaid: 5000, outstanding: 2000 }),
      marks: expect.objectContaining({ average: 70, exams: expect.arrayContaining([expect.objectContaining({ id: 'mark-1' })]) }),
      behavior: expect.objectContaining({ incidents: 1, logs: expect.arrayContaining([expect.objectContaining({ id: 'behavior-1' })]) }),
      timeline: [expect.objectContaining({ title: 'Follow-up' })],
    }));
    expect(sources.attendance.findByStudentId).toHaveBeenCalledWith('tenant-a', 'student-1');
    expect(sources.fees.findByStudent).toHaveBeenCalledWith('tenant-a', 'student-1');
    expect(sources.marks.findByStudent).toHaveBeenCalledWith('tenant-a', 'student-1');
    expect(sources.behavior.findByStudent).toHaveBeenCalledWith('student-1', 'tenant-a');
  });

  test('does not read dependent records when the student is outside the tenant', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null) } as any;
    const sources = {
      attendance: { findByStudentId: jest.fn() },
      fees: { findByStudent: jest.fn() },
      marks: { findByStudent: jest.fn() },
      behavior: { findByStudent: jest.fn() },
    };
    const service = new StudentService(repository, sources as any);

    await expect(service.student360('tenant-b', 'student-1')).resolves.toBeNull();
    expect(sources.attendance.findByStudentId).not.toHaveBeenCalled();
  });
});

describe('StudentService.update', () => {
  test('preserves omitted nested fields when applying a partial student update', async () => {
    const stored = {
      id: 'student-1',
      tenantId: 'tenant-a',
      admissionNumber: 'ADM-1',
      rollNumber: '7',
      cnic: '12345',
      fullName: 'Ada Lovelace',
      gender: 'Female',
      dob: '1815-12-10',
      classGrade: '10',
      section: 'A',
      admissionDate: '2025-04-01',
      phone: '111',
      email: 'ada@example.test',
      address: 'Existing address',
      guardianName: 'Existing guardian',
      guardianRelation: 'Parent',
      guardianPhone: '222',
      emergencyContactPhone: '333',
      bloodGroup: 'A+',
      medicalConditions: 'None',
      religion: 'None',
      nationality: 'PK',
      previousSchool: 'Existing school',
      status: 'Active',
      metadata: { version: 1, createdAt: 'created-at', source: 'web' },
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(stored),
      update: jest.fn().mockResolvedValue(undefined),
    } as any;
    const service = new StudentService(repository);

    await service.update('tenant-a', 'student-1', {
      contacts: { phone: '999', email: 'ada@example.test', address: 'Existing address' },
    } as any, 'admin-1');

    expect(repository.update).toHaveBeenCalledWith('student-1', expect.objectContaining({
      fullName: 'Ada Lovelace',
      classGrade: '10',
      section: 'A',
      guardianName: 'Existing guardian',
      phone: '999',
      metadata: expect.objectContaining({ createdAt: 'created-at' }),
    }), 'tenant-a');
  });
});
