// __tests__/services/data-integrity-security.test.ts
// Security Regression Tests for Sprint 11 — Student Data Integrity Remediation
// These tests validate that client-supplied classGrade/section CANNOT override
// authoritative Student record values.

import { AttendanceService } from '@/services/attendance.service';
import { MarksService } from '@/services/marks.service';
import { AttendanceRepository } from '@/repositories/attendance.repository';
import { MarksRepository } from '@/repositories/marks.repository';
import { StudentRepository } from '@/repositories/student.repository';
import { NotFoundException, BusinessError } from '@/errors/AppError';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('Sprint 11 — Data Integrity Security Regression Tests', () => {
  const tenantId = 'test-tenant';
  const tenantIdB = 'tenant-b';

  describe('TEST GROUP 1 — ATTENDANCE createSingle', () => {
    let attendanceService: AttendanceService;
    let mockSave: jest.Mock;
    let mockStudentRepoFindById: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockSave = jest.fn();
      mockStudentRepoFindById = jest.fn();

      const mockAttendanceRepo = {
        save: mockSave,
      } as any;

      attendanceService = new AttendanceService(mockAttendanceRepo);
      (attendanceService as any).studentRepo = {
        findById: mockStudentRepoFindById,
      };
    });

    test('LEGITIMATE: Authoritative class from Student is persisted', async () => {
      const mockStudent = {
        id: 'student-s1',
        classGrade: '10',
        section: 'A',
        fullName: 'Test Student',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudent);
      mockSave.mockResolvedValue({
        id: 'student-s1_2024-06-01',
        studentId: 'student-s1',
        classGrade: '10',
        section: 'A',
        date: '2024-06-01',
        status: 'Present',
        tenantId: 'test-tenant',
      });

      const result = await attendanceService.createSingle(
        {
          studentId: 'student-s1',
          classGrade: '10',
          section: 'A',
          date: '2024-06-01',
          status: 'Present',
        },
        tenantId,
        'user-1'
      );

      expect(result.classGrade).toBe('10');
      expect(result.section).toBe('A');

      const savedDocument = mockSave.mock.calls[0][0];
      expect(savedDocument.classGrade).toBe('10');
      expect(savedDocument.section).toBe('A');
    });

    test('ADVERSARIAL: Forged classGrade is NEVER persisted — authoritative Student values used', async () => {
      const mockStudent = {
        id: 'student-s1',
        classGrade: '10',
        section: 'A',
        fullName: 'Test Student',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudent);
      mockSave.mockResolvedValue({
        id: 'student-s1_2024-06-01',
        studentId: 'student-s1',
        classGrade: '10',
        section: 'A',
        date: '2024-06-01',
        status: 'Present',
        tenantId: 'test-tenant',
      });

      await attendanceService.createSingle(
        {
          studentId: 'student-s1',
          classGrade: '99',
          section: 'X',
          date: '2024-06-01',
          status: 'Present',
        },
        tenantId,
        'user-1'
      );

      const savedDocument = mockSave.mock.calls[0][0];
      expect(savedDocument.classGrade).toBe('10');
      expect(savedDocument.section).toBe('A');
      expect(savedDocument.classGrade).not.toBe('99');
      expect(savedDocument.section).not.toBe('X');
    });

    test('SECURITY: Forged section is NEVER persisted', async () => {
      const mockStudent = {
        id: 'student-s1',
        classGrade: '10',
        section: 'A',
        fullName: 'Test Student',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudent);
      mockSave.mockResolvedValue({
        id: 'student-s1_2024-06-01',
        studentId: 'student-s1',
        classGrade: '10',
        section: 'A',
        date: '2024-06-01',
        status: 'Present',
        tenantId: 'test-tenant',
      });

      await attendanceService.createSingle(
        {
          studentId: 'student-s1',
          classGrade: '10',
          section: 'WRONG',
          date: '2024-06-01',
          status: 'Present',
        },
        tenantId,
        'user-1'
      );

      const savedDocument = mockSave.mock.calls[0][0];
      expect(savedDocument.section).toBe('A');
      expect(savedDocument.section).not.toBe('WRONG');
    });

    test('MISSING STUDENT: NotFoundException thrown — NO record created', async () => {
      mockStudentRepoFindById.mockResolvedValue(null);

      await expect(
        attendanceService.createSingle(
          {
            studentId: 'DOES_NOT_EXIST',
            classGrade: '10',
            section: 'A',
            date: '2024-06-01',
            status: 'Present',
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student not found');

      expect(mockSave).not.toHaveBeenCalled();
    });

    test('STUDENT WITHOUT CLASS: BusinessError thrown — NO record created', async () => {
      const mockStudentWithoutClass = {
        id: 'student-no-class',
        classGrade: '',
        section: 'A',
        fullName: 'Student Without Class',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudentWithoutClass);

      await expect(
        attendanceService.createSingle(
          {
            studentId: 'student-no-class',
            classGrade: '10',
            section: 'A',
            date: '2024-06-01',
            status: 'Present',
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student has no class assignment');

      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('TEST GROUP 2 — ATTENDANCE createBulk', () => {
    let attendanceService: AttendanceService;
    let mockBulkCreate: jest.Mock;
    let mockStudentRepoBatchFindByIds: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockBulkCreate = jest.fn();
      mockStudentRepoBatchFindByIds = jest.fn();

      const mockAttendanceRepo = {
        bulkCreate: mockBulkCreate,
      } as any;

      attendanceService = new AttendanceService(mockAttendanceRepo);
      (attendanceService as any).studentRepo = {
        batchFindByIds: mockStudentRepoBatchFindByIds,
      };
    });

    test('BULK: Authoritative class used for each student — forged values rejected', async () => {
      const students = [
        { id: 'student-a', classGrade: '10', section: 'A', fullName: 'Student A', tenantId: 'test-tenant' },
        { id: 'student-b', classGrade: '11', section: 'B', fullName: 'Student B', tenantId: 'test-tenant' },
      ];

      mockStudentRepoBatchFindByIds.mockResolvedValue(students);
      mockBulkCreate.mockResolvedValue(['att-a', 'att-b']);

      await attendanceService.createBulk(
        [
          { studentId: 'student-a', classGrade: '99', section: 'X', date: '2024-06-01', status: 'Present' },
          { studentId: 'student-b', classGrade: '88', section: 'Y', date: '2024-06-01', status: 'Present' },
        ],
        tenantId,
        'user-1'
      );

      expect(mockBulkCreate).toHaveBeenCalledTimes(1);
      const savedRecords = mockBulkCreate.mock.calls[0][0];

      expect(savedRecords[0].classGrade).toBe('10');
      expect(savedRecords[0].section).toBe('A');
      expect(savedRecords[0].classGrade).not.toBe('99');
      expect(savedRecords[0].section).not.toBe('X');

      expect(savedRecords[1].classGrade).toBe('11');
      expect(savedRecords[1].section).toBe('B');
      expect(savedRecords[1].classGrade).not.toBe('88');
      expect(savedRecords[1].section).not.toBe('Y');
    });

    test('BATCH ATOMICITY: Entire batch rejected when any student missing', async () => {
      const students = [
        { id: 'student-a', classGrade: '10', section: 'A', fullName: 'Student A', tenantId: 'test-tenant' },
      ];

      mockStudentRepoBatchFindByIds.mockResolvedValue(students);

      await expect(
        attendanceService.createBulk(
          [
            { studentId: 'student-a', classGrade: '10', section: 'A', date: '2024-06-01', status: 'Present' },
            { studentId: 'student-b', classGrade: '11', section: 'B', date: '2024-06-01', status: 'Present' },
          ],
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student student-b not found');

      expect(mockBulkCreate).not.toHaveBeenCalled();
    });

    test('BULK ATOMICITY: Entire batch rejected when any student lacks class', async () => {
      const students = [
        { id: 'student-a', classGrade: '10', section: 'A', fullName: 'Student A', tenantId: 'test-tenant' },
        { id: 'student-b', classGrade: '', section: 'B', fullName: 'Student B', tenantId: 'test-tenant' },
      ];

      mockStudentRepoBatchFindByIds.mockResolvedValue(students);

      await expect(
        attendanceService.createBulk(
          [
            { studentId: 'student-a', classGrade: '10', section: 'A', date: '2024-06-01', status: 'Present' },
            { studentId: 'student-b', classGrade: '10', section: 'B', date: '2024-06-01', status: 'Present' },
          ],
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student student-b has no class assignment');

      expect(mockBulkCreate).not.toHaveBeenCalled();
    });

    test('DUPLICATE STUDENT: Student resolved once per unique studentId', async () => {
      const students = [
        { id: 'student-a', classGrade: '10', section: 'A', fullName: 'Student A', tenantId: 'test-tenant' },
      ];

      mockStudentRepoBatchFindByIds.mockResolvedValue(students);
      mockBulkCreate.mockResolvedValue(['att-1', 'att-2']);

      await attendanceService.createBulk(
        [
          { studentId: 'student-a', classGrade: '10', section: 'A', date: '2024-06-01', status: 'Present' },
          { studentId: 'student-a', classGrade: '10', section: 'A', date: '2024-06-02', status: 'Absent' },
        ],
        tenantId,
        'user-1'
      );

      expect(mockStudentRepoBatchFindByIds).toHaveBeenCalledWith('test-tenant', ['student-a']);
      expect(mockBulkCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('TEST GROUP 3 — MARKS saveMark', () => {
    let marksService: MarksService;
    let mockUpsert: jest.Mock;
    let mockStudentRepoFindById: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockUpsert = jest.fn();
      mockStudentRepoFindById = jest.fn();

      const mockMarksRepo = {
        upsert: mockUpsert,
      } as any;

      marksService = new MarksService(mockMarksRepo);
      (marksService as any).studentRepo = {
        findById: mockStudentRepoFindById,
      };
    });

    test('ADVERSARIAL: Forged classGrade is NEVER persisted', async () => {
      const mockStudent = {
        id: 'student-s1',
        classGrade: '10',
        section: 'A',
        fullName: 'Test Student',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudent);
      mockUpsert.mockResolvedValue(undefined);

      await marksService.saveMark(
        {
          studentId: 'student-s1',
          classGrade: '99',
          section: 'X',
          term: 'Q1',
          subject: 'Math',
          marksObtained: 85,
          totalMarks: 100,
        },
        tenantId,
        'user-1'
      );

      const savedData = mockUpsert.mock.calls[0][1];
      expect(savedData.classGrade).toBe('10');
      expect(savedData.section).toBe('A');
      expect(savedData.classGrade).not.toBe('99');
      expect(savedData.section).not.toBe('X');
    });

    test('MISSING STUDENT: NotFoundException — NO mark created', async () => {
      mockStudentRepoFindById.mockResolvedValue(null);

      await expect(
        marksService.saveMark(
          {
            studentId: 'DOES_NOT_EXIST',
            classGrade: '10',
            section: 'A',
            term: 'Q1',
            subject: 'Math',
            marksObtained: 85,
            totalMarks: 100,
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student not found');

      expect(mockUpsert).not.toHaveBeenCalled();
    });

    test('STUDENT WITHOUT CLASS: BusinessError — NO mark created', async () => {
      const mockStudentWithoutClass = {
        id: 'student-no-class',
        classGrade: '',
        section: 'A',
        fullName: 'Student Without Class',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudentWithoutClass);

      await expect(
        marksService.saveMark(
          {
            studentId: 'student-no-class',
            classGrade: '10',
            section: 'A',
            term: 'Q1',
            subject: 'Math',
            marksObtained: 85,
            totalMarks: 100,
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student has no class assignment');

      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe('TEST GROUP 4 — SKILLS saveSkills', () => {
    let marksService: MarksService;
    let mockCreate: jest.Mock;
    let mockUpsert: jest.Mock;
    let mockFindWithFilters: jest.Mock;
    let mockStudentRepoFindById: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockCreate = jest.fn();
      mockUpsert = jest.fn();
      mockFindWithFilters = jest.fn();
      mockStudentRepoFindById = jest.fn();

      const mockMarksRepo = {
        create: mockCreate,
        upsert: mockUpsert,
        findWithFilters: mockFindWithFilters,
      } as any;

      marksService = new MarksService(mockMarksRepo);
      (marksService as any).studentRepo = {
        findById: mockStudentRepoFindById,
      };
    });

    test('SKILLS: Authoritative Student class is used — NOT empty strings', async () => {
      const mockStudent = {
        id: 'student-s1',
        classGrade: '10',
        section: 'A',
        fullName: 'Test Student',
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudent);
      mockFindWithFilters.mockResolvedValue([]);
      mockCreate.mockResolvedValue('skill-mark-1');

      await marksService.saveSkills(
        {
          studentId: 'student-s1',
          term: 'Q1',
          subject: 'Art',
          skills: { creativity: 90 },
        },
        tenantId,
        'user-1'
      );

      const savedData = mockCreate.mock.calls[0][0];
      expect(savedData.classGrade).toBe('10');
      expect(savedData.section).toBe('A');
      expect(savedData.classGrade).not.toBe('');
      expect(savedData.section).not.toBe('');
    });

    test('SKILLS: Missing student — NotFoundException — NO skills mark created', async () => {
      mockStudentRepoFindById.mockResolvedValue(null);

      await expect(
        marksService.saveSkills(
          {
            studentId: 'DOES_NOT_EXIST',
            term: 'Q1',
            subject: 'Art',
            skills: { creativity: 90 },
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student not found');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    test('SKILLS: Existing mark update does NOT rewrite historical classGrade/section', async () => {
      const mockStudent = {
        id: 'student-s1',
        classGrade: '10',
        section: 'A',
        fullName: 'Test Student',
        tenantId: 'test-tenant',
      };

      const existingMark = {
        id: 'existing-mark-1',
        studentId: 'student-s1',
        classGrade: '10',
        section: 'A',
        term: 'Q1',
        subject: 'Art',
        skills: { creativity: 80 },
        tenantId: 'test-tenant',
      };

      mockStudentRepoFindById.mockResolvedValue(mockStudent);
      mockFindWithFilters.mockResolvedValue([existingMark]);
      mockUpsert.mockResolvedValue(undefined);

      await marksService.saveSkills(
        {
          studentId: 'student-s1',
          term: 'Q1',
          subject: 'Art',
          skills: { creativity: 90 },
        },
        tenantId,
        'user-1'
      );

      const updateData = mockUpsert.mock.calls[0][1];
      expect(updateData.skills).toEqual({ creativity: 90 });
      expect(updateData.classGrade).toBeUndefined();
      expect(updateData.section).toBeUndefined();
    });
  });

  describe('TEST GROUP 5 — TENANT ISOLATION', () => {
    let attendanceService: AttendanceService;
    let marksService: MarksService;
    let mockAttendanceSave: jest.Mock;
    let mockMarksUpsert: jest.Mock;
    let mockStudentRepoFindById: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockAttendanceSave = jest.fn();
      mockMarksUpsert = jest.fn();
      mockStudentRepoFindById = jest.fn();

      const mockAttendanceRepo = { save: mockAttendanceSave } as any;
      const mockMarksRepo = { upsert: mockMarksUpsert } as any;

      attendanceService = new AttendanceService(mockAttendanceRepo);
      (attendanceService as any).studentRepo = { findById: mockStudentRepoFindById };

      marksService = new MarksService(mockMarksRepo);
      (marksService as any).studentRepo = { findById: mockStudentRepoFindById };
    });

    test('ATTENDANCE: Cross-tenant student resolution fails — NotFoundException', async () => {
      mockStudentRepoFindById.mockResolvedValue(null);

      await expect(
        attendanceService.createSingle(
          {
            studentId: 'student-s1',
            classGrade: '10',
            section: 'A',
            date: '2024-06-01',
            status: 'Present',
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student not found');

      expect(mockAttendanceSave).not.toHaveBeenCalled();
    });

    test('MARKS: Cross-tenant student resolution fails — NotFoundException', async () => {
      mockStudentRepoFindById.mockResolvedValue(null);

      await expect(
        marksService.saveMark(
          {
            studentId: 'student-s1',
            classGrade: '10',
            section: 'A',
            term: 'Q1',
            subject: 'Math',
            marksObtained: 85,
            totalMarks: 100,
          },
          tenantId,
          'user-1'
        )
      ).rejects.toThrow('Student not found');

      expect(mockMarksUpsert).not.toHaveBeenCalled();
    });
  });

  describe('TEST GROUP 6 — HISTORICAL DATA', () => {
    test('EXISTING PATTERN: Historical records must remain unchanged after remediation', async () => {
      const historicalAttendance = {
        id: 'historical-att',
        studentId: 'student-s1',
        classGrade: '9',
        section: 'B',
        date: '2023-01-15',
        status: 'Present',
        tenantId: 'test-tenant',
      };

      expect(historicalAttendance.classGrade).toBe('9');
      expect(historicalAttendance.section).toBe('B');
      expect(historicalAttendance.date).toBe('2023-01-15');
    });
  });

  describe('TEST GROUP 7 — AUTHORITATIVE SOURCE INVARIANT', () => {
    test('CRITICAL: No fallback chain student?.classGrade || parsed.classGrade', async () => {
      const marksServiceSource = require('fs')
        .readFileSync('./services/marks.service.ts', 'utf8');

      const attendanceServiceSource = require('fs')
        .readFileSync('./services/attendance.service.ts', 'utf8');

      const forbiddenPatterns = [
        /student\?\.classGrade\s*\|\|/,
        /student\?\.section\s*\|\|/,
        /\.classGrade\s*\|\|\s*parsed/,
        /\.section\s*\|\|\s*parsed/,
      ];

      for (const pattern of forbiddenPatterns) {
        expect(marksServiceSource).not.toMatch(pattern);
        expect(attendanceServiceSource).not.toMatch(pattern);
      }
    });
  });

  describe('TEST GROUP 8 — REPOSITORY STRATEGY', () => {
    test('SERVICE: Uses class-level studentRepo property (not ad-hoc in method)', () => {
      const marksService = new MarksService();
      expect((marksService as any).studentRepo).toBeInstanceOf(StudentRepository);

      const attendanceService = new AttendanceService();
      expect((attendanceService as any).studentRepo).toBeInstanceOf(StudentRepository);
    });
  });
});
