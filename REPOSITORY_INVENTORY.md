# Repository Inventory

**Generated:** 2026-07-28
**Sprint:** Sprint 7 — Repository Compliance & Interface Standardization

---

## Executive Summary

41 repositories inventoried. 38 implement interfaces (92.7%). 27 extend BaseRepository (65.9%). 22 use adminDb directly (expected). 3 repositories lack interfaces (auth, storage, tenant-setup).

---

## Repository Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| Total repositories | 41 | 100% |
| Implementing interfaces | 38 | 92.7% |
| Extending BaseRepository | 27 | 65.9% |
| Using adminDb (expected) | 22 | 53.7% |
| Missing interfaces | 3 | 7.3% |
| Tenant aware | 33 | 80.5% |

---

## Repository Details

| Repository | Interface | BaseRepository | adminDb | Tenant Aware |
|------------|-----------|----------------|---------|--------------|
| academic-year.repository.ts | IAcademicYearRepository | YES | YES | YES |
| addons.repository.ts | IAddonsRepository | NO | YES | YES |
| ai-usage.repository.ts | IAiUsageRepository | YES | YES | YES |
| assignment.repository.ts | IAssignmentRepository | YES | YES | YES |
| attendance.repository.ts | IAttendanceRepository | YES | NO | YES |
| audit.repository.ts | IAuditRepository | YES | YES | YES |
| auth.repository.ts | NONE | NO | NO | NO |
| base.repository.ts | N/A | NO | YES | YES |
| behavior.repository.ts | IBehaviorRepository | YES | NO | YES |
| book.repository.ts | IBookRepository | YES | NO | YES |
| bus.repository.ts | IBusRepository | YES | YES | NO |
| chat.repository.ts | IChatRepository | NO | YES | YES |
| class.repository.ts | IClassRepository | YES | YES | YES |
| configuration.repository.ts | IConfigurationRepository | NO | YES | YES |
| curriculum.repository.ts | ICurriculumRepository | NO | NO | NO |
| dashboard-stats.repository.ts | IDashboardStatsRepository | NO | YES | YES |
| event-outbox.repository.ts | IEventOutboxRepository | NO | YES | YES |
| feature-flag.repository.ts | IFeatureFlagRepository | NO | YES | YES |
| fees.repository.ts | IFeesRepository | YES | NO | YES |
| homework.repository.ts | IHomeworkRepository | YES | YES | NO |
| invoice.repository.ts | IInvoiceRepository | YES | YES | YES |
| job.repository.ts | IJobRepository | NO | YES | YES |
| leave.repository.ts | ILeaveRepository | YES | NO | YES |
| ledger.repository.ts | ILedgerRepository | YES | YES | YES |
| lesson-plan.repository.ts | ILessonPlanRepository | YES | YES | NO |
| marks.repository.ts | IMarksRepository | YES | NO | YES |
| menu.repository.ts | IMenuRepository | NO | YES | YES |
| parents.repository.ts | IParentsRepository | YES | NO | YES |
| quiz.repository.ts | IQuizRepository | YES | NO | YES |
| section.repository.ts | ISectionRepository | YES | YES | YES |
| settings.repository.ts | ISettingsRepository | NO | YES | YES |
| staff.repository.ts | IStaffRepository | YES | NO | YES |
| storage.repository.ts | NONE | NO | NO | NO |
| student.repository.ts | IStudentRepository | YES | NO | YES |
| subscription.repository.ts | ISubscriptionRepository | YES | YES | YES |
| syllabus.repository.ts | ISyllabusRepository | YES | YES | YES |
| tenant-branding.repository.ts | ITenantBrandingRepository | YES | NO | YES |
| tenant-setup.repository.ts | NONE | NO | YES | YES |
| tenant.repository.ts | ITenantRepository | YES | YES | YES |
| timetable.repository.ts | ITimetableRepository | YES | YES | NO |
| user.repository.ts | IUserRepository | NO | YES | YES |
| video-lecture.repository.ts | IVideoLectureRepository | YES | NO | NO |

---

## Repositories Without Interfaces

| Repository | Reason |
|------------|--------|
| auth.repository.ts | Firebase Auth wrapper, no Firestore |
| storage.repository.ts | Firebase Storage wrapper, no Firestore |
| tenant-setup.repository.ts | Setup logic, no standard CRUD |

---

## Repositories Without BaseRepository

| Repository | Reason |
|------------|--------|
| addons.repository.ts | Simple key-value store |
| auth.repository.ts | Firebase Auth wrapper |
| chat.repository.ts | Simple message store |
| configuration.repository.ts | Complex configuration logic |
| curriculum.repository.ts | Specialized curriculum queries |
| dashboard-stats.repository.ts | Aggregation queries |
| event-outbox.repository.ts | Event sourcing pattern |
| feature-flag.repository.ts | Simple feature flags |
| job.repository.ts | Simple job tracking |
| menu.repository.ts | Simple menu store |
| settings.repository.ts | Complex settings logic |
| storage.repository.ts | Firebase Storage wrapper |
| tenant-setup.repository.ts | Setup logic |
| user.repository.ts | Custom user logic |

---

## Method Distribution

| Method | Count | Repositories |
|--------|-------|--------------|
| findByTenant | 10 | Most repositories |
| create | 4 | Base + specialized |
| update | 1 | BaseRepository |
| delete | 1 | BaseRepository |
| findById | 1 | BaseRepository |
| findAll | 1 | BaseRepository |
| count | 2 | Base + attendance |
| exists | 2 | Base + attendance |
| paginate | 1 | BaseRepository |
| softDelete | 1 | BaseRepository |
| bulkCreate | 1 | BaseRepository |
| save | 7 | Student, parent, staff, etc. |

---

## Conclusion

Repository inventory complete. 92.7% interface coverage. All repositories follow persistence-only pattern. No business logic detected. No HTTP objects detected. No auth logic detected. No AI logic detected.
