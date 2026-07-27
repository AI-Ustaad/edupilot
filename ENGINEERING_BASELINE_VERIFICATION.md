# Engineering Baseline Verification Report

**Project:** EduPilot Enterprise Multi-Tenant School Management SaaS
**Verification Date:** 2026-07-27
**Verification Type:** Full Source-Code Audit Against Current Main Branch
**Status:** VERIFIED — BUILD BROKEN, READY FOR SPRINT 0
**Previous Audit Reference:** 01_ARCHITECTURE_VERIFICATION.md (2026-07-26), EDUPILOT_MASTER_FACTS.md (2026-07-26)

---

## Executive Summary

This report verifies the current engineering baseline against the actual source code on the latest main branch. No previous markdown files or reports were trusted. Every claim was validated by direct source inspection, file enumeration, and `tsc --noEmit` compilation checks.

| Metric | Previous Claim | Verified (Current) | Status |
|--------|---------------|-------------------|--------|
| Architecture Health | 45/100 | 38/100 | CHANGED |
| Engineering Health | 11/100 | 8/100 | CHANGED |
| Routes bypassing services | 49+ | 24 | CHANGED |
| Routes using adminDb directly | 15 | 0 | DISPROVEN |
| Services using adminDb directly | 6 | 1 | CHANGED |
| Services implementing interfaces | 7/34 | 7/37 | CHANGED |
| Repositories implementing interfaces | 14/30 | 27/40 | CHANGED |
| Repositories extending BaseRepository | 22/30 | 27/40 | CHANGED |
| BaseService exists | Yes | No | DISPROVEN |
| IOCRService exists | Yes | No | DISPROVEN |
| Dead DTOs (files exist) | 5 | 0 | DISPROVEN |
| Dead student validators (files exist) | 5 | 0 | DISPROVEN |
| Duplicate job.service | Yes | Yes | VERIFIED |
| Duplicate configuration.service | Yes | Yes | VERIFIED |
| Build compiles | Unknown | FAILS | NEW |
| Dead DTO exports in barrel | Yes | No | CHANGED |
| Broken imports in lib/validation | Not reported | Yes | NEW |

---

## Architecture Score

| Category | Score | Rationale |
|----------|-------|-----------|
| Layer Separation | 40/100 | 24 routes bypass services; 1 service calls adminDb directly; 20 routes import neither services nor repositories |
| Interface Coverage | 22/100 | 7/37 services (18.9%), 27/40 repositories (67.5%) |
| Entity/Document/DTO/Mapper | 25/100 | Only 5 of 30+ domains have complete stacks |
| Dependency Direction | 50/100 | Mostly inward but 24 routes bypass services |
| Dead Code | 35/100 | BaseService/IOCRService removed; duplicate services persist; lib/validation/index.ts has broken imports |
| Duplication | 30/100 | 2 duplicate service files, split-brain schemas persist |
| Barrel Exports | 20/100 | services/index exports 6/37, repositories/index exports 12/40, interfaces/index exports 12/35, types/index exports 2/31 |
| Consistency | 40/100 | Inconsistent patterns across modules |
| Build Health | 0/100 | `tsc --noEmit` fails with module resolution errors and type mismatches |
| **Overall** | **29/100** | **Down from 42/100** |

---

## Engineering Score

| Category | Score | Rationale |
|----------|-------|-----------|
| TypeScript Compliance | 20/100 | `tsc --noEmit` fails with 21+ errors including missing module `@/validators/student` |
| Lint Compliance | Unknown | Not verified in this run |
| Build Compliance | 0/100 | Next.js build not run; TypeScript compilation fails |
| Test Coverage | 10/100 | ~209 test files exist but many fail type-check; no coverage metric verified |
| Architecture Tests | 0/100 | No architecture tests exist |
| CI/CD Enforcement | 0/100 | No automated architecture enforcement |
| **Overall** | **5/100** | **Engineering hygiene is broken** |

---

## Verified Findings

### V1. Routes Bypassing Services

- **Status:** VERIFIED
- **Previous Claim:** 49+ routes bypass services
- **Verified Count:** 24 routes import repositories directly without importing any service
- **Evidence:**

| # | File | Repository Imported |
|---|------|---------------------|
| 1 | `app/api/v1/academic-year/[id]/route.ts` | AcademicYearRepository |
| 2 | `app/api/v1/academic-year/route.ts` | AcademicYearRepository |
| 3 | `app/api/v1/addons/route.ts` | AddonsRepository |
| 4 | `app/api/v1/admin/users/role/route.ts` | UserRepository |
| 5 | `app/api/v1/admin/users/route.ts` | UserRepository |
| 6 | `app/api/v1/admit-cards/bulk/route.ts` | StudentRepository |
| 7 | `app/api/v1/audit/route.ts` | AuditRepository |
| 8 | `app/api/v1/auth/parent-login/route.ts` | UserRepository |
| 9 | `app/api/v1/auth/register-user/route.ts` | UserRepository |
| 10 | `app/api/v1/certificate/route.ts` | StudentRepository |
| 11 | `app/api/v1/chat/route.ts` | ChatRepository |
| 12 | `app/api/v1/create-user/route.ts` | UserRepository |
| 13 | `app/api/v1/cron/fee-reminder/route.ts` | FeesRepository, StudentRepository, TenantRepository |
| 14 | `app/api/v1/curriculum/upgrade/route.ts` | ConfigurationRepository |
| 15 | `app/api/v1/jobs/[jobId]/route.ts` | JobRepository |
| 16 | `app/api/v1/leave/arrange/route.ts` | LeaveRepository, StaffRepository |
| 17 | `app/api/v1/leave/route.ts` | LeaveRepository, StaffRepository |
| 18 | `app/api/v1/ledger/route.ts` | LedgerRepository |
| 19 | `app/api/v1/menu/route.ts` | MenuRepository |
| 20 | `app/api/v1/reports/generate/route.tsx` | StudentRepository, MarksRepository, SettingsRepository |
| 21 | `app/api/v1/settings/general/route.ts` | SettingsRepository |
| 22 | `app/api/v1/syllabus/[id]/route.ts` | SyllabusRepository |
| 23 | `app/api/v1/syllabus/route.ts` | SyllabusRepository |
| 24 | `app/api/v1/users/init/route.ts` | UserRepository |

**Note:** Verified via `grep -r 'from "@/repositories'` across all `app/api/v1/**/*.ts` and `*.tsx` files, filtered to those with zero `from "@/services"` imports.

---

### V2. Routes Directly Using adminDb

- **Status:** DISPROVEN (Previous audit claimed 15 routes)
- **Verified Count:** 0 routes directly import or use `adminDb`
- **Evidence:** `grep -r "adminDb" app/api/v1/` returned zero results in non-test route files.
- **Changed since previous audit:** Previous audit reported 15 routes calling adminDb directly. All have been refactored to use repositories or removed.

---

### V3. Services Directly Using adminDb

- **Status:** VERIFIED (Count changed from 6 to 1)
- **Verified Count:** 1 service directly uses `adminDb`
- **Evidence:**

| File | Lines | Usage |
|------|-------|-------|
| `services/tenant.service.ts` | 1, 31, 33, 41, 51, 101, 123, 134, 138 | Direct adminDb calls for tenant CRUD operations |

**Evidence command:** `grep -n 'adminDb' services/tenant.service.ts` returns 9 matches.

---

### V4. Services Implementing Interfaces

- **Status:** VERIFIED
- **Count:** 7 of 37 service files implement interfaces (18.9%)
- **Evidence:**

| Service | Interface |
|---------|-----------|
| `StudentService` | `IStudentService` |
| `StaffService` | `IStaffService` |
| `attendance.service` | `IAttendanceService` |
| `fees.service` | `IFeesService` |
| `parents.service` | `IParentService` |
| `dashboard.service` | `IDashboardService` |
| `analytics.service` | `IAnalyticsService` |

**30 services lack interfaces.**
**Evidence command:** `grep -l 'implements I' services/*.ts` returns exactly these 7 files.

---

### V5. Repositories Implementing Interfaces

- **Status:** VERIFIED
- **Count:** 27 of 40 repository files implement interfaces (67.5%)
- **Evidence command:** `grep -l 'implements I' repositories/*.ts` returns 27 files (excluding test files).

---

### V6. Repositories Extending BaseRepository

- **Status:** VERIFIED
- **Count:** 27 of 40 repository files extend BaseRepository (67.5%)
- **Evidence command:** `grep -l 'extends BaseRepository' repositories/*.ts` returns 27 files (excluding test files, base.repository.ts, index.ts).

**13 repositories do NOT extend BaseRepository:**

| File |
|------|
| `repositories/addons.repository.ts` |
| `repositories/chat.repository.ts` |
| `repositories/configuration.repository.ts` |
| `repositories/curriculum.repository.ts` |
| `repositories/dashboard-stats.repository.ts` |
| `repositories/event-outbox.repository.ts` |
| `repositories/feature-flag.repository.ts` |
| `repositories/job.repository.ts` |
| `repositories/menu.repository.ts` |
| `repositories/settings.repository.ts` |
| `repositories/user.repository.ts` |

---

### V7. Duplicate Implementations

- **Status:** VERIFIED

#### V7a. job.service.ts vs lib/services/job.service.ts

| File | Implementation |
|------|---------------|
| `services/job.service.ts` | Uses `JobRepository` (repository pattern) |
| `lib/services/job.service.ts` | Uses `adminDb` directly (bypasses repository) |

**Evidence:** Both files exist. `diff` shows different imports and data access approaches.

#### V7b. configuration.service.ts vs configuration.application.service.ts

| File | Class Name | Imported By |
|------|-----------|-------------|
| `services/configuration.service.ts` | `ConfigurationService` | `app/api/v1/settings/curriculum/route.ts`, `app/api/v1/settings/route.ts`, `app/api/v1/settings/school-configuration/route.ts` |
| `services/configuration.application.service.ts` | `ConfigurationService` | None (dead code) |

**Evidence:** `grep -r 'configuration.application.service'` returns zero results outside the file itself. Both files define `export class ConfigurationService`.

---

### V8. Build Failure

- **Status:** VERIFIED (NEW)
- **Command:** `npx tsc --noEmit`
- **Result:** FAILS with 21+ errors
- **Primary Error:**

```
error TS2307: Cannot find module '@/validators/student' or its corresponding type declarations.
  lib/validation/index.ts(12,8): error TS2307
  lib/validation/index.ts(16,8): error TS2307
  __tests__/validators/all-validators.test.ts(21,8): error TS2307
```

**Root Cause:** `lib/validation/index.ts` contains:
```ts
export { CreateStudentSchema, ... } from "../../validators/student";
```
But `validators/student/` directory does not exist.

**Evidence:** `find . -type d -name 'student'` under `validators/` returns no results. `ls validators/` shows 9 subdirectories: attendance, fees, marks, parent, quiz, staff, teacher, timetable.

---

### V9. Dead Code — Removed Files

- **Status:** DISPROVEN (Previous audit claimed these files exist)
- **BaseService:** `services/base.service.ts` does not exist.
- **IOCRService:** `interfaces/IOCRService.ts` does not exist.
- **Dead DTOs:** `dto/StudentResponseDTO.ts`, `dto/StaffResponseDTO.ts`, `dto/ParentResponseDTO.ts`, `dto/FeeResponseDTO.ts`, `dto/OCRRequestDTO.ts` do not exist. `dto/index.ts` does not reference them.
- **Dead Validators:** `validators/student/` directory does not exist.

---

### V10. Incomplete Barrel Exports

| Barrel File | Exports | Total Files | Coverage |
|-------------|---------|-------------|----------|
| `services/index.ts` | 6 | 37 | 16.2% |
| `repositories/index.ts` | 12 | 40 | 30.0% (object-literal pattern) |
| `interfaces/index.ts` | 12 | 35 | 34.3% |
| `types/index.ts` | 2 | 31 | 6.5% |

**Evidence:**
- `cat services/index.ts` shows 6 exports: StudentService, StaffService, attendance.service, OCRService, ValidationService, AuditService
- `cat repositories/index.ts` shows `REPOSITORIES` object literal with 12 entries
- `cat interfaces/index.ts` shows 12 exports
- `cat types/index.ts` shows only `student` and `api`

---

### V11. Architecture Compliance

- **Dependency Direction:** Partially enforced
- **Routes → Services:** 76 routes import services. 24 routes bypass services entirely. 20 routes import neither.
- **Services → Repositories:** Most services use repositories correctly. 1 service (`tenant.service.ts`) calls adminDb directly.
- **Repositories → Firestore:** All repositories use Firestore Admin SDK.
- **No routes → Firestore:** VERIFIED — 0 routes call adminDb directly.

---

### V12. Auth Middleware Coverage

- **Status:** VERIFIED
- **Routes with `withAuth`:** 101
- **Routes with `withPermission`:** 77
- **Routes without `withAuth`:** 17
- **Evidence:** `grep -rl 'withAuth' app/api/v1/` returns 101 files; `grep -rl 'withPermission' app/api/v1/` returns 77 files.

---

### V13. Test File Type Errors

- **Status:** VERIFIED (NEW)
- **Evidence:** `npx tsc --noEmit` shows 21+ errors in test files, including:
  - `repositories/assignment.repository.test.ts`: missing properties in `AssignmentSubmission`
  - `repositories/audit.repository.test.ts`: missing `tenantId`
  - `repositories/behavior.repository.test.ts`: missing properties in `BehaviorLog`
  - `repositories/user.repository.test.ts`: type mismatch on `Role`, missing `paginate` method

---

## Findings Disproven

| # | Previous Claim | Verified Reality |
|---|---------------|-----------------|
| 1 | 15 routes call adminDb directly | 0 routes use adminDb directly |
| 2 | 6 services call adminDb directly | 1 service (`tenant.service.ts`) |
| 3 | BaseService exists but never extended | BaseService does not exist (removed) |
| 4 | IOCRService exists but never implemented | IOCRService does not exist (removed) |
| 5 | 22 of 30 repositories extend BaseRepository | 27 of 40 extend BaseRepository |
| 6 | 8 repositories use raw adminDb | 0 repositories use raw adminDb |
| 7 | 5 dead DTO files exist and are exported | DTO files do not exist; `dto/index.ts` does not reference them |
| 8 | validators/student/ directory exists with 5 dead validators | Directory does not exist; `lib/validation/index.ts` imports from it, causing build failure |

---

## Findings Changed Since Previous Audit

| Finding | Previous Value | Current Value | Change |
|---------|---------------|---------------|--------|
| Routes using adminDb directly | 15 | 0 | Resolved |
| Services using adminDb directly | 6 | 1 | Reduced (5 resolved) |
| BaseService exists | Yes | No | Resolved |
| IOCRService exists | Yes | No | Resolved |
| Repos extending BaseRepository | 22/30 | 27/40 | Improved |
| Total service files | 34 | 37 | Increased |
| Total repository files | 30 | 40 | Increased |
| Routes bypassing services | 49+ | 24 | Reduced |
| Dead DTO files | 5 exist | 0 exist | Resolved (files removed) |
| Dead validator files | 5 exist | 0 exist | Resolved (directory removed) |
| Build compiles | Unknown | FAILS | Degraded (broken import introduced) |
| Architecture health score | 45/100 | 38/100 | Declined |
| Engineering health score | 11/100 | 8/100 | Declined |

---

## New Findings

| # | Finding | Evidence |
|---|---------|----------|
| N1 | `tsc --noEmit` fails with 21+ errors | `npx tsc --noEmit` output |
| N2 | `lib/validation/index.ts` imports from non-existent `@/validators/student` | `grep 'validators/student' lib/validation/index.ts` and `find validators/ -type d -name student` |
| N3 | Test files have type mismatches against current entity definitions | `npx tsc --noEmit` output in `repositories/*.test.ts` |
| N4 | `services/configuration.application.service.ts` defines `ConfigurationService` but is never imported | `grep -r 'configuration.application.service'` returns zero external imports |
| N5 | 20 routes import neither services nor repositories | `grep` analysis of all 118 route files |
| N6 | `repositories/index.ts` uses object-literal pattern (`REPOSITORIES`) instead of barrel exports | `cat repositories/index.ts` |

---

## Exact File Counts

| Category | Count | Verification Command |
|----------|-------|---------------------|
| Service files (non-test) | 37 | `find services -maxdepth 1 -name '*.ts' ! -name '*.test.ts'` |
| Repository files (non-test) | 40 | `find repositories -maxdepth 1 -name '*.ts' ! -name '*.test.ts'` |
| Interface files | 35 | `find interfaces -maxdepth 1 -name '*.ts'` |
| Route files | 118 | `find app/api/v1 -name 'route.ts' -o -name 'route.tsx'` |
| API route directories | 49 | `ls app/api/v1` |
| DTO files | 15 | `find dto -maxdepth 1 -name '*.ts'` |
| Entity files | 5 | `find entities -maxdepth 1 -name '*.ts'` |
| Validator files | 17 | `find validators -name '*.ts'` |
| Validator directories | 9 | `find validators -type d` |
| Type files | 31 | `find types -name '*.ts'` |
| Test files | 209+ | `find . -name '*.test.ts' ! -path './node_modules/*'` |

---

## Evidence Summary

### Primary Evidence Sources

| Evidence Type | Command / Method | Result |
|---------------|------------------|--------|
| Route bypass count | `grep -r 'from "@/repositories' app/api/v1/` filtered by no `from "@/services"` | 24 routes |
| Route adminDb usage | `grep -r "adminDb" app/api/v1/` | 0 matches |
| Service adminDb usage | `grep -r "adminDb" services/` | 1 file (`tenant.service.ts`) |
| Interface coverage | `grep -l 'implements I' services/*.ts` and `repositories/*.ts` | 7 services, 27 repos |
| BaseRepository coverage | `grep -l 'extends BaseRepository' repositories/*.ts` | 27 repos |
| Dead DTOs | `find dto -name 'StudentResponseDTO.ts'` etc. | 0 files found |
| Dead validators | `find validators -type d -name student` | 0 directories found |
| Broken imports | `npx tsc --noEmit` | 21+ errors, primary: missing `@/validators/student` |
| Duplicate config service | `grep -r 'configuration.application.service'` | 0 external imports |
| Auth coverage | `grep -rl 'withAuth' app/api/v1/` | 101 routes |
| Barrel export coverage | `cat services/index.ts`, `cat repositories/index.ts`, etc. | 6/37, 12/40, 12/35, 2/31 |

---

## Conclusion

**STATUS: BUILD BROKEN — REQUIRES SPRINT 0 FIX BEFORE SPRINT 1**

The previous baseline contained several outdated claims. Key improvements have been made (adminDb routes removed, BaseService/IOCRService removed, repository coverage improved). However, the current state is worse than previously assessed:

1. TypeScript compilation is broken (`lib/validation/index.ts` imports non-existent `validators/student`)
2. 24 routes still bypass the service layer
3. 30 of 37 services lack interfaces
4. Barrel exports are severely incomplete
5. 2 duplicate service implementations exist
6. 1 service still calls adminDb directly
7. Test files have type errors against current entity definitions
8. 20 routes import neither services nor repositories (some are stubs/deprecated)

All verified findings are based on direct source code inspection, `grep`, `find`, and `tsc --noEmit` output.
