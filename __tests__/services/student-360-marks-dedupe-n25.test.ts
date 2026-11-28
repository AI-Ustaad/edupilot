import { StudentService } from '@/services/StudentService';
import { dedupeMarksBySubjectAndTerm } from '@/lib/aggregations/shared-metrics';

// N25 — Student 360 "Recent Marks" showed English 88 and Mathematics 92
// each twice (Ahmed Shah, Class 1-A, 1st Term). The marks collection can hold
// the same logical mark under more than one doc id, and student360() returned
// the rows verbatim. One row per subject per exam is the accept criterion.

function buildService(marksFixture: any[]) {
  const studentRepository = {
    findById: jest.fn().mockResolvedValue({
      id: 'ahmed-shah-1',
      tenantId: 'tenant-a',
      fullName: 'Ahmed Shah',
      classGrade: '1',
      section: 'A',
      metadata: {},
    }),
    timeline: jest.fn().mockResolvedValue([]),
  } as any;
  const sources = {
    attendance: { findByStudentId: jest.fn().mockResolvedValue([]) },
    fees: { findByStudent: jest.fn().mockResolvedValue([]) },
    marks: { findByStudent: jest.fn().mockResolvedValue(marksFixture) },
    behavior: { findByStudent: jest.fn().mockResolvedValue([]) },
  };
  return new StudentService(studentRepository, sources as any);
}

describe('N25 — student360 Recent Marks dedupe (audit fixture)', () => {
  test('English 88 and Mathematics 92 each appear exactly once', async () => {
    const service = buildService([
      { id: 'ahmed-shah-1_1stTerm_English', subject: 'English', term: '1st Term', marksObtained: 88, totalMarks: 100, percentage: 88, updatedAt: '2026-11-26T10:00:00.000Z' },
      { id: 'random-doc-1', subject: 'English', term: '1st Term', marksObtained: 88, totalMarks: 100, percentage: 88, updatedAt: '2026-11-25T09:00:00.000Z' },
      { id: 'ahmed-shah-1_1stTerm_Mathematics', subject: 'Mathematics', term: '1st Term', marksObtained: 92, totalMarks: 100, percentage: 92, updatedAt: '2026-11-26T10:00:00.000Z' },
      { id: 'random-doc-2', subject: 'Mathematics', term: '1st Term', marksObtained: 92, totalMarks: 100, percentage: 92, updatedAt: '2026-11-25T09:00:00.000Z' },
    ]);

    const aggregate = await service.student360('tenant-a', 'ahmed-shah-1');

    expect(aggregate?.marks.exams).toHaveLength(2);
    expect(aggregate?.marks.exams.map((m: any) => `${m.subject} ${m.marksObtained}`).sort()).toEqual([
      'English 88',
      'Mathematics 92',
    ]);
    // The average must be computed from the deduped list, not the doubled one.
    expect(aggregate?.marks.average).toBe(90);
    expect(aggregate?.marks.records).toHaveLength(2);
  });

  test('the same subject in different exams stays as separate rows', async () => {
    const service = buildService([
      { id: 'm1', subject: 'English', term: '1st Term', marksObtained: 88, totalMarks: 100, percentage: 88 },
      { id: 'm2', subject: 'English', term: 'Final Exams', marksObtained: 85, totalMarks: 100, percentage: 85 },
    ]);

    const aggregate = await service.student360('tenant-a', 'ahmed-shah-1');

    expect(aggregate?.marks.exams).toHaveLength(2);
  });

  test('when duplicates disagree, the most recently updated row wins', async () => {
    const service = buildService([
      { id: 'old-doc', subject: 'English', term: '1st Term', marksObtained: 80, totalMarks: 100, percentage: 80, updatedAt: '2026-11-20T09:00:00.000Z' },
      { id: 'new-doc', subject: 'English', term: '1st Term', marksObtained: 88, totalMarks: 100, percentage: 88, updatedAt: '2026-11-26T10:00:00.000Z' },
    ]);

    const aggregate = await service.student360('tenant-a', 'ahmed-shah-1');

    expect(aggregate?.marks.exams).toHaveLength(1);
    expect(aggregate?.marks.exams[0]).toEqual(expect.objectContaining({ id: 'new-doc', marksObtained: 88 }));
  });

  test('rows without a subject are never collapsed into each other', async () => {
    const service = buildService([
      { id: 'mark-1', marksObtained: 80, totalMarks: 100 },
      { id: 'mark-2', percentage: 60, marksObtained: 30, totalMarks: 50 },
    ]);

    const aggregate = await service.student360('tenant-a', 'ahmed-shah-1');

    expect(aggregate?.marks.exams).toHaveLength(2);
    expect(aggregate?.marks.average).toBe(70);
  });
});

describe('N25 — dedupeMarksBySubjectAndTerm', () => {
  test('returns [] for empty or non-array input', () => {
    expect(dedupeMarksBySubjectAndTerm([])).toEqual([]);
    expect(dedupeMarksBySubjectAndTerm(undefined as any)).toEqual([]);
  });

  test('collapses term-spelling variants the normalizer unifies', () => {
    const rows = dedupeMarksBySubjectAndTerm([
      { id: 'a', subject: 'English', term: 'Final Exam', marksObtained: 85, totalMarks: 100 },
      { id: 'b', subject: 'English', term: 'Final Exams', marksObtained: 85, totalMarks: 100 },
    ]);
    expect(rows).toHaveLength(1);
  });

  test('collapses subject variants the canonicalizer unifies', () => {
    const rows = dedupeMarksBySubjectAndTerm([
      { id: 'a', subject: 'Math', term: '1st Term', marksObtained: 92, totalMarks: 100 },
      { id: 'b', subject: 'Mathematics', term: '1st Term', marksObtained: 92, totalMarks: 100 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].subject).toBe('Math');
  });

  test('keeps different subjects and different exams, preserving first-seen order', () => {
    const rows = dedupeMarksBySubjectAndTerm([
      { id: 'a', subject: 'English', term: '1st Term', marksObtained: 88, totalMarks: 100 },
      { id: 'b', subject: 'Mathematics', term: '1st Term', marksObtained: 92, totalMarks: 100 },
      { id: 'c', subject: 'English', term: 'Final Exams', marksObtained: 85, totalMarks: 100 },
    ]);
    expect(rows.map((r: any) => r.id)).toEqual(['a', 'b', 'c']);
  });

  test('skips null entries', () => {
    const rows = dedupeMarksBySubjectAndTerm([
      null as any,
      { id: 'a', subject: 'English', term: '1st Term', marksObtained: 88, totalMarks: 100 },
    ]);
    expect(rows).toHaveLength(1);
  });
});
