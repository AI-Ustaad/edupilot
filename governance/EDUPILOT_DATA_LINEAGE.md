# EDUPILOT — DATA LINEAGE

Format per entity: CREATE → STORE → REFERENCE → READ → TRANSFORM → DISPLAY
Classification tags: ✅ PROVEN (source) | ⚠️ PARTIAL | ❌ BROKEN/MISSING | ⛔ UNVERIFIED (no safe runtime env)

---

## STUDENT
- CREATE: `POST /api/v1/students` → `StudentService.create` (`StudentService.ts:24`)
- STORE: `tenants/{tenantId}/students` (collection `"students"`), auto-id `studentId` (`base.repository.ts:36`)
- REFERENCE: `tenantId`, `primaryParentId`, `classGrade` (from classId), `section`
- READ: `student.repository.ts` (all queries `.where("tenantId")`)
- TRANSFORM: `StudentPersistenceMapper.toFirestore` / `fromFirestore`
- DISPLAY: student profile page, student360 (⚠️ HARDCODED STUBS `StudentService.ts:141-148`)
- ❌ Broken: classId→classGrade naming; campusId lost; academicYearId/admissionId absent

## SCHOOL CONFIGURATION
- CREATE: `POST /api/v1/settings/school-configuration` → `configurationService.saveAndPublishConfiguration` (`configuration.service.ts:108`)
- STORE: `tenants/{tenantId}/settings/config` (doc id `"config"`) ✅ PROVEN
- REFERENCE: `school.*`, `academic.*` (classes, sections, subjects)
- READ: `configurationRepo.getConfiguration` ✅ PROVEN
- TRANSFORM: `configuration-dashboard.service.ts:getCounts` / `calcCompletion`
- DISPLAY: configuration-dashboard page ❌ BROKEN — counts from empty live collections (F-01)

## ACADEMIC YEAR
- CREATE: `academicYearRepo` / `findAllByTenant`
- STORE: `tenants/{tenantId}/academicYears` ⚠️ PARTIAL (no proven student.academicYearId link)

## CLASS / SECTION
- CREATE: `classRepo.getAll`, `sectionRepo.findAllActive`
- STORE: collection `"sections"` (class repo reads from `sections`) ⚠️ naming quirk
- REFERENCE: student links via `classGrade`/`section` strings (not IDs)

## SUBJECT
- STORE: inside config doc `academic.subjects` ✅ PROVEN; no standalone subject collection used by marks (marks use free-text `subject`)

## TEACHER / STAFF
- STORE: `tenants/{tenantId}/staff` ✅ PROVEN
- REFERENCE: staffRepo.findAll used by dashboard count

## FEE
- CREATE: `POST /api/v1/fees` → `FeesService.createFee` ✅ PROVEN
- STORE: `tenants/{tenantId}/fees` (fields: amountPaid, status, dueDate — ❌ no `amount`/`balance`/`paidAmount`)
- REFERENCE: `fee.studentId` (reverse)
- ❌ BROKEN: `paid` filter on missing field; `fee-reminder` prints `undefined` amount

## FEE STRUCTURE
- ❌ MISSING: read-only repo, no write path, empty config route dir

## INVOICE
- CREATE: `invoice.service.ts:createFromStripe` (Stripe subscription only) ✅ PROVEN
- STORE: `tenants/{tenantId}/invoices`
- ❌ Not student fee invoices

## PAYMENT
- ⚠️ PARTIAL: a "payment" = new `fees` doc; no separate payment entity

## EXAM
- ❌ MISSING: no exam entity/repo/collection/enrollment/examId

## MARKS
- CREATE: `POST /api/v1/marks` → `MarksService.saveMark` ✅ PROVEN
- STORE: `tenants/{tenantId}/marks`, docId `${studentId}_${term}_${subject}`
- REFERENCE: `marks.studentId` (reverse)
- READ: `marks.repository.ts` (tenant-scoped)

## RESULT
- TRANSFORM: `marks.service.ts:getAggregatedResults` (computed on-read) ✅ PROVEN
- DISPLAY: results page; publish emails parents ✅ PROVEN
- ❌ Not persisted as a result document

## ATTENDANCE
- CREATE: `POST /api/v1/attendance` → `AttendanceService.create*` ✅ PROVEN
- STORE: `tenants/{tenantId}/attendance`, docId `${studentId}_${date}`
- READ: daily + 7-day trend ✅; monthly ❌ MISSING
- REFERENCE: `attendance.studentId` (reverse)

## QUIZ SUBMISSION (tenant-isolation break)
- CREATE: `quiz.repository.ts:createSubmission` ❌ writes WITHOUT tenantId (`_tenantId` ignored)
- READ: `findSubmissionsByQuiz` filters by tenantId → cross-tenant mismatch

---

## BROKEN LINKS SUMMARY
1. Student → Class (ID naming drift)
2. Student → academicYearId / admissionId (absent)
3. Student → Fees/Attendance/Exams (no student-side array; 360 stubbed)
4. Config wizard → live collections (dashboard 0%)
5. Fee → balance/paidAmount (field model broken)
6. Exam module (entirely missing)
7. Quiz submission → tenantId (not written)
8. Student360 → live repos (hardcoded stubs)

*Source-only lineage. No production data read. ⛔ marks items as UNVERIFIED where runtime confirmation was required and no safe test tenant/emulator existed.*
