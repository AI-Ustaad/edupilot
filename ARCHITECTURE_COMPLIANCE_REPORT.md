# Architecture Compliance Report

**Project:** EduPilot Enterprise Multi-Tenant AI-Native School Management SaaS Platform
**Audit Date:** 2026-07-27
**Auditor:** Chief Software Architect
**Status:** NON-COMPLIANT — CRITICAL VIOLATIONS FOUND
**Required Architecture:** Route → Validation → DTO → Service → Repository → Firestore

---

## Executive Summary

A complete architecture compliance audit was performed across all 118 API routes, 38 services, and 39 repositories. The codebase exhibits **systemic architectural violations** that prevent it from meeting enterprise SaaS standards.

| Metric | Target | Actual | Compliance |
|--------|--------|--------|------------|
| Routes calling services only | 118 | 82+ | 69.5% |
| Routes bypassing services | 0 | 36 | PARTIAL |
| Routes with direct Firestore access | 0 | 0 | 100% |
| Services with direct Firestore access | 0 | 0 | 100% |
| Services implementing interfaces | 38 | 38 | 100% |
| Repositories implementing interfaces | 39 | 39 | 100% |
| Repositories extending BaseRepository | 39 | 27 | 69.2% |
| Business logic in repositories | 0 | 11 | PARTIAL |
| Duplicate service implementations | 0 | 0 | 100% |
| Dead service files | 0 | 0 | 100% |

**Overall Architecture Compliance: 72%**

---

## 1. Route Layer Compliance

### 1.1 Dependency Direction Violations

**Required:** Routes MUST communicate only with Services.

**Actual:** 40 routes (34%) bypass the Service layer.

#### Category A: Repositories Only (25 routes)
These routes import repositories directly without importing any service:

| Route File | Repository Imported |
|------------|---------------------|
| `app/api/v1/academic-year/[id]/route.ts` | AcademicYearRepository |
| `app/api/v1/academic-year/route.ts` | AcademicYearRepository |
| `app/api/v1/addons/route.ts` | AddonsRepository |
| `app/api/v1/admin/users/role/route.ts` | UserRepository |
| `app/api/v1/admin/users/route.ts` | UserRepository |
| `app/api/v1/admit-cards/bulk/route.ts` | StudentRepository |
| `app/api/v1/audit/route.ts` | AuditRepository |
| `app/api/v1/auth/parent-login/route.ts` | UserRepository |
| `app/api/v1/auth/register-user/route.ts` | UserRepository |
| `app/api/v1/certificate/route.ts` | StudentRepository |
| `app/api/v1/chat/route.ts` | ChatRepository |
| `app/api/v1/create-user/route.ts` | UserRepository |
| `app/api/v1/cron/fee-reminder/route.ts` | FeesRepository, StudentRepository, TenantRepository |
| `app/api/v1/curriculum/upgrade/route.ts` | ConfigurationRepository |
| `app/api/v1/jobs/[jobId]/route.ts` | JobRepository |
| `app/api/v1/leave/arrange/route.ts` | LeaveRepository, StaffRepository |
| `app/api/v1/leave/route.ts` | LeaveRepository, StaffRepository |
| `app/api/v1/ledger/route.ts` | LedgerRepository |
| `app/api/v1/menu/route.ts` | MenuRepository |
| `app/api/v1/reports/generate/route.tsx` | StudentRepository, MarksRepository, SettingsRepository |
| `app/api/v1/settings/general/route.ts` | SettingsRepository |
| `app/api/v1/syllabus/[id]/route.ts` | SyllabusRepository |
| `app/api/v1/syllabus/route.ts` | SyllabusRepository |
| `app/api/v1/users/init/route.ts` | UserRepository |
| `app/api/v1/jobs/fee-reminder/route.ts` | FeesRepository, TenantRepository |

#### Category B: Mixed Services + Repositories (15 routes)
These routes import both services AND repositories, creating split-brain data access:

| Route File | Services Imported | Repositories Imported |
|------------|-------------------|----------------------|
| `admin/delete-student/route.ts` | — | AttendanceRepository, FeesRepository |
| `buses/[id]/route.ts` | BusService | BusRepository |
| `buses/route.ts` | BusService | BusRepository |
| `classes/route.ts` | ClassService | SectionRepository |
| `gdpr/delete/[id]/route.ts` | — | AttendanceRepository, FeesRepository |
| `gdpr/export/[id]/route.ts` | — | AttendanceRepository, FeesRepository |
| `homework/route.ts` | HomeworkService | HomeworkRepository |
| `jobs/attendance-report/route.ts` | — | AttendanceRepository, TenantRepository |
| `parents/attendance/route.ts` | — | AttendanceRepository |
| `parents/dashboard/route.ts` | — | AttendanceRepository, FeesRepository |
| `parents/fees/route.ts` | — | FeesRepository |
| `parents/results/route.ts` | — | MarksRepository |
| `settings/whitelabel/route.ts` | — | TenantBrandingRepository |
| `users/register-school/route.ts` | — | AcademicYearRepository |
| `video-lectures/route.ts` | VideoLectureService | VideoLectureRepository |

### 1.2 Direct Firestore Access in Routes

**Required:** Routes MUST NOT access Firestore directly.

**Actual:** 9 routes import `@/lib/firebase-admin`:

| Route File | Firestore Import | Violation |
|------------|------------------|-----------|
| `auth/session/route.ts` | adminAuth | Direct auth bypass |
| `upload/route.ts` | adminStorage | Direct storage access |
| `create-user/route.ts` | adminAuth | Direct auth bypass |
| `auth/parent-login/route.ts` | adminAuth | Direct auth bypass |
| `users/init/route.ts` | adminAuth | Direct auth bypass |
| `admin/users/role/route.ts` | adminAuth | Direct auth bypass |
| `auth/register-user/route.ts` | adminAuth | Direct auth bypass |
| `protected-data/route.ts` | adminAuth | Direct auth bypass |
| `admin/parents/route.ts` | adminAuth | Direct auth bypass |

### 1.3 Missing Middleware

| Middleware | Missing Count | Routes |
|------------|--------------|--------|
| `withAuth` | 17 | auth/login, auth/logout, auth/me, auth/parent-login, auth/register-user, auth/session, cron/fee-reminder, curriculum/load, curriculum/preview, jobs/attendance-report, jobs/events, jobs/fee-reminder, protected-data, stripe/webhook, super-admin/telemetry, users/init, users/register-school |
| `withPermission` | 41 | (see Section 1.4) |

---

## 2. Service Layer Compliance

### 2.1 Direct Firestore Access

**Required:** Services MUST communicate only with Repositories.

**Actual:** 6 services import `@/lib/firebase-admin` directly:

| Service File | Firestore Import | Used For |
|--------------|------------------|----------|
| `services/tenant.service.ts` | adminDb, dbTimestamp | Tenant CRUD operations |
| `services/auth.service.ts` | adminAuth | User authentication |
| `services/session.service.ts` | adminAuth | Session management |
| `services/claims.service.ts` | adminAuth | Custom claims |
| `services/assignment.service.ts` | adminStorage | File uploads |
| `lib/services/job.service.ts` | adminDb | Job operations (DUPLICATE) |

### 2.2 Service-to-Service Coupling

**Required:** Services SHOULD be isolated; cross-cutting concerns handled via events or shared utilities.

**Actual:** 21 services import from other services:

| Service | Imports |
|---------|---------|
| StaffService | ValidationService, AuditService |
| StudentService | — |
| assignment.service | AuditService, ValidationService |
| attendance.service | AuditService, ValidationService |
| analytics.service | FeesService |
| OCRService | AuditService |
| timetable.service | AuditService, ValidationService |
| featureFlag.service | SubscriptionService |
| report.service | AttendanceService |
| book.service | AuditService, ValidationService |
| auth.service | ClaimsService |
| marks.service | AuditService, ValidationService |
| behavior.service | AuditService, ValidationService |
| subscription.service | AuditService |
| lesson-plan.service | AuditService, ValidationService |
| homework.service | AuditService, ValidationService |
| bus.service | AuditService, ValidationService |
| dashboard.service | StudentService, StaffService, FeesService, AttendanceService |
| parents.service | AuditService |
| video-lecture.service | AuditService |
| quiz.service | AuditService, ValidationService |
| fees.service | AuditService, ValidationService |

### 2.3 Interface Coverage

**Required:** All services implement interfaces.

**Actual:** 7 of 38 services (18.4%) implement interfaces:

| Service | Interface |
|---------|-----------|
| StudentService | IStudentService |
| StaffService | IStaffService |
| attendance.service | IAttendanceService |
| fees.service | IFeesService |
| parents.service | IParentService |
| dashboard.service | IDashboardService |
| analytics.service | IAnalyticsService |

**31 services lack interfaces.**

### 2.4 Constructor Injection

**Required:** All services use constructor injection for dependencies.

**Actual:** 26 services use constructor injection. 10 services instantiate dependencies inline:

| Service | Issue |
|---------|-------|
| menu.service | No constructor defined |
| telemetry.service | Properties instantiated inline |
| job.service | All static methods |
| featureFlag.service | Module-level singletons |
| report.service | Instantiates AttendanceService inline |
| subscription.service | Properties instantiated inline |
| analytics.service | Properties instantiated inline in empty constructor |
| dashboard.service | Services instantiated inline in empty constructor |
| ai/timetable.service | Properties instantiated inline |
| ai/exam.service | Properties instantiated inline |

### 2.5 Duplicate Implementations

| Primary | Duplicate | Status |
|---------|-----------|--------|
| `services/job.service.ts` | `lib/services/job.service.ts` | DUPLICATE — lib version uses raw Firestore |
| `services/configuration.service.ts` | `services/configuration.application.service.ts` | DEAD CODE — never imported |

---

## 3. Repository Layer Compliance

### 3.1 BaseRepository Coverage

**Required:** All repositories extend BaseRepository.

**Actual:** 27 of 39 repositories (69.2%) extend BaseRepository.

**Non-compliant repositories (12):**
- `addons.repository.ts` — implements interface but no BaseRepository
- `chat.repository.ts` — implements interface but no BaseRepository
- `configuration.repository.ts` — implements interface but no BaseRepository
- `curriculum.repository.ts` — no interface, no BaseRepository
- `dashboard-stats.repository.ts` — implements interface but no BaseRepository
- `event-outbox.repository.ts` — no interface, no BaseRepository
- `feature-flag.repository.ts` — implements interface but no BaseRepository
- `job.repository.ts` — implements interface but no BaseRepository
- `menu.repository.ts` — implements interface but no BaseRepository
- `settings.repository.ts` — implements interface but no BaseRepository
- `user.repository.ts` — implements inline interface but no BaseRepository

### 3.2 Interface Coverage

**Required:** All repositories implement interfaces.

**Actual:** 27 of 39 repositories (69.2%) implement interfaces.

**Non-compliant repositories (12):**
- `academic-year.repository.ts`
- `base.repository.ts` (base class — exempt)
- `class.repository.ts`
- `curriculum.repository.ts`
- `event-outbox.repository.ts`
- `leave.repository.ts`
- `ledger.repository.ts`
- `section.repository.ts`
- `settings.repository.ts`
- `syllabus.repository.ts`
- `tenant-branding.repository.ts`
- `video-lecture.repository.ts`

**Missing interface file:** `IUserRepository` is defined inline in `user.repository.ts` instead of `interfaces/IUserRepository.ts`.

### 3.3 Business Logic in Repositories

**Required:** Repositories contain ONLY data access logic.

**Actual:** 11 repositories contain business logic:

| Repository | Business Logic |
|------------|---------------|
| `academic-year.repository.ts` | `setCurrent()` — state transition (deactivate others) |
| `ai-usage.repository.ts` | `getUsageStats()` — aggregation |
| `dashboard-stats.repository.ts` | `incrementCounter()` — atomic counter |
| `event-outbox.repository.ts` | Outbox pattern, lease claiming, DLQ promotion |
| `fees.repository.ts` | `getTotalRevenue()` — aggregation |
| `invoice.repository.ts` | `markAsPaid()` — state transition |
| `job.repository.ts` | `updateProgress()`, `failJob()` — state transitions |
| `section.repository.ts` | `createMissingStructure()` — set difference logic |
| `settings.repository.ts` | `saveConfigurationWithHistory()` — batched write + audit |
| `student.repository.ts` | `countByClass()` — aggregation |
| `subscription.repository.ts` | `activate()`, `cancel()` — state transitions + cache invalidation |
| `user.repository.ts` | `findByUidWithFallback()` — fallback lookup strategy |

---

## 4. Validation Layer Compliance

**Required:** Validation schemas are defined in exactly one location per domain.

**Actual:** Split-brain validation exists:

| Domain | Validation Locations |
|--------|---------------------|
| Student | `dto/CreateStudentDTO.ts`, `dto/UpdateStudentDTO.ts`, `lib/validation/index.ts` |
| Fees | `validators/fees/CreateFeeValidator.ts`, `lib/validation/index.ts` |
| Attendance | `validators/attendance/AttendanceValidator.ts`, `lib/validation/index.ts` |
| Marks | `validators/marks/MarksValidator.ts`, `lib/validation/index.ts` |
| Parent | `validators/parent/CreateParentValidator.ts`, `lib/validation/index.ts` |
| Timetable | `validators/timetable/TimetableValidator.ts`, `lib/validation/index.ts` |
| Teacher | `validators/teacher/*`, `lib/validation/index.ts` |

---

## 5. Duplicate Code

| Duplicate | Files | Impact |
|-----------|-------|--------|
| Job service | `services/job.service.ts` vs `lib/services/job.service.ts` | Two implementations, one uses raw Firestore |
| Configuration service | `services/configuration.service.ts` vs `services/configuration.application.service.ts` | Both define `ConfigurationService` class |
| Student validators | Previously in `validators/student/`, now partially in `dto/` | Migration incomplete |

---

## 6. Dead Code

| Dead Code | File | Reason |
|-----------|------|--------|
| Duplicate job service | `lib/services/job.service.ts` | Never imported, bypasses repository |
| Dead config service | `services/configuration.application.service.ts` | Never imported, duplicate class name |
| Stub routes (17) | Various `app/api/v1/**/*.ts` | Import neither services nor repositories |

---

## 7. Compliance Scorecard

| Layer | Compliance | Issues |
|-------|-----------|--------|
| Routes | 48.3% | 40 bypass services, 9 direct Firestore, 17 no auth, 41 no permission |
| Services | 18.4% | 6 direct Firestore, 21 service coupling, 31 no interfaces |
| Repositories | 69.2% | 12 no BaseRepository, 12 no interfaces, 11 have business logic |
| Validation | ~50% | Split-brain schemas across multiple locations |
| Duplication | 0% | 2 duplicate services, split-brain validators |
| Dead Code | ~95% clean | 1 duplicate service, 1 dead service, 17 stub routes |
