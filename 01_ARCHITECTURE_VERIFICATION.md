# 01_ARCHITECTURE_VERIFICATION.md

**Project:** EduPilot Enterprise Multi-Tenant School Management SaaS  
**Date:** 2026-07-26  
**Verification Type:** Baseline Architecture Audit  
**Status:** PRE-PRODUCTION — PARTIAL IMPLEMENTATION

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Overall Architecture Health | 5/10 |
| Verified Components | 23 |
| Partially Verified Components | 12 |
| Not Verified Components | 0 |
| Dead Implementations | 8 |
| Duplicate Implementations | 4 |
| Wired But Not Verified | 15 |

### Major Findings

1. **Clean Architecture partially enforced.** 5 of 30 domains have complete layered stacks (Student, Staff, Attendance, Fees, Parents). 25 domains lack entity/document/DTO/mapper layers.
2. **Repository Pattern inconsistent.** 22 of 30 repositories extend `BaseRepository`. 8 repositories use raw `adminDb` without the base abstraction.
3. **Service Layer coverage 20%.** Only 7 of 34 services implement interfaces. 27 services have no formal contract.
4. **Split-brain validation.** Validation schemas exist in 3 locations: `validators/`, `lib/validation/`, and `dto/`. Student validators in `validators/student/` are dead at runtime (replaced by `dto/` schemas but never removed).
5. **Dead code present.** `BaseService` is never extended. `IOCRService` is never implemented. 5 DTOs are exported but never used.
6. **Direct Firestore access from routes.** 15 route files call `adminDb` directly, bypassing repositories.
7. **Services directly calling Firestore.** 6 services call `adminDb` directly, bypassing repositories.
8. **Barrel exports incomplete.** `services/index.ts` exports 8 of 34 services. `repositories/index.ts` exports 3 of 30 repositories. `types/index.ts` exports 2 of 20+ type files.

---

## 1.1 Folder Structure

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| `app/api/v1/` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 118 route files found |
| `app/(protected)/` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 67 page files found |
| `services/` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | 37 files; 7 with interfaces, 30 without |
| `repositories/` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 33 files; 22 extend BaseRepository, 11 do not |
| `interfaces/` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 23 interface files |
| `entities/` | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 5 entity files; 25+ domains missing |
| `documents/` | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 5 document files; 25+ domains missing |
| `dto/` | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 20 DTO files; 5 dead DTOs, 15 domains missing DTOs |
| `lib/mappers/` | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 13 mapper files; 5 domain mappers, 8 configuration mappers |
| `validators/` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | 22 validator files; split-brain across 3 locations |
| `hooks/` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 43 hook files |
| `context/` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 2 context files |
| `types/` | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 20+ type files; incomplete barrel export |

---

## 1.2 Clean Architecture

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Dependency direction (inward) | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | Routes → Services → Repositories → Firestore. Some routes call repositories directly. |
| No service-to-service imports | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | `services/parents.service.ts` imports `StudentService`. `services/dashboard.service.ts` imports 4 services. |
| No repository-to-service imports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | No reverse dependencies found |
| No domain-to-infrastructure leaks | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | Entities import from `@/types/student` in some cases |
| Application layer separation | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No use-case/application layer between routes and services |

---

## 1.3 DDD

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Entities | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 5 entities (Student, Staff, Attendance, Fee, Parent). 25+ domains missing entities. |
| Value Objects | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No value objects found. All domain objects are plain interfaces. |
| Aggregates | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No aggregate roots or boundaries defined |
| Domain Events | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | 62 event types defined. Student lifecycle events have no publishers. |
| Domain Services | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No domain services; all logic in application services |
| Repositories (DDD) | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | 14 repositories implement interfaces. 16 do not. |

---

## 1.4 Repository Pattern

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| BaseRepository | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | `repositories/base.repository.ts` provides generic CRUD |
| Extends BaseRepository | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 22 of 30 repositories extend BaseRepository. 8 do not. |
| Uses `this.db` | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 22 repositories use `this.db`. 8 use raw `adminDb`. |
| Uses `this.collectionName` | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 22 repositories use `this.collectionName`. 8 hardcode collection names. |
| Tenant scoping in queries | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | All properly implemented repositories filter by `tenantId` |
| No business logic | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | `student.repository.ts` and `staff.repository.ts` contain analytics/timeline logic |
| Interface implementation | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 14 of 30 repositories implement interfaces |

### Repositories NOT extending BaseRepository
| File | Reason |
|------|--------|
| `repositories/addons.repository.ts` | Standalone implementation |
| `repositories/configuration.repository.ts` | Custom mapping logic |
| `repositories/curriculum.repository.ts` | In-memory only |
| `repositories/event-outbox.repository.ts` | Outbox pattern implementation |
| `repositories/menu.repository.ts` | Standalone implementation |
| `repositories/settings.repository.ts` | Standalone implementation |
| `repositories/user.repository.ts` | Standalone implementation |
| `repositories/job.repository.ts` | Standalone implementation |

---

## 1.5 Service Layer

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Service count | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 34 services found |
| Interface implementation | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 7 of 34 implement interfaces (Student, Staff, Attendance, Fees, Parents, Dashboard, Analytics) |
| DTO usage | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 5 services use DTOs. 29 do not. |
| Mapper usage | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 5 services use mappers. 29 do not. |
| No persistence logic | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | 6 services call `adminDb` directly |
| No business logic in routes | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | 15 routes call `adminDb` directly |
| Constructor injection | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | 7 services use constructor injection. 27 instantiate dependencies internally. |

### Services with Interfaces
| Service | Interface |
|---------|-----------|
| `StudentService` | `IStudentService` |
| `StaffService` | `IStaffService` |
| `AttendanceService` | `IAttendanceService` |
| `FeesService` | `IFeesService` |
| `ParentsService` | `IParentService` |
| `DashboardService` | `IDashboardService` |
| `AnalyticsService` | `IAnalyticsService` |

### Services Directly Calling Firestore
| Service | File | Line(s) |
|---------|------|---------|
| `SubscriptionService` | `services/subscription.service.ts` | Multiple |
| `FeatureFlagService` | `services/featureFlag.service.ts` | Multiple |
| `JobService` | `services/job.service.ts` | Multiple |
| `TelemetryService` | `services/telemetry.service.ts` | Multiple |
| `AnalyticsService` | `services/analytics.service.ts` | Multiple |
| `AuditService` | `services/AuditService.ts` | Multiple |

---

## 1.6 DTO Layer

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| DTO count | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 20 DTO files |
| Active DTOs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 15 DTOs actively used by services/mappers |
| Dead DTOs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 5 DTOs exported but never imported: `StudentResponseDTO`, `StaffResponseDTO`, `ParentResponseDTO`, `FeeResponseDTO`, `OCRRequestDTO` |
| Missing DTOs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 25+ domains missing DTOs |
| DTOs with Zod schemas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 13 DTOs embed Zod validation schemas |
| Split-brain schemas | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ❌ | Same schemas duplicated in `validators/`, `lib/validation/`, and `dto/` |

### Dead DTOs
| File | Evidence |
|------|----------|
| `dto/StudentResponseDTO.ts` | Exported via `dto/index.ts` but never imported by any service, component, or hook |
| `dto/StaffResponseDTO.ts` | Exported via `dto/index.ts` but never imported by any service, component, or hook |
| `dto/ParentResponseDTO.ts` | Exported via `dto/index.ts` but never imported by any service, component, or hook |
| `dto/FeeResponseDTO.ts` | Exported via `dto/index.ts` but never imported by any service, component, or hook |
| `dto/OCRRequestDTO.ts` | Exported via `dto/index.ts` but `OCRService` does not use it |

---

## 1.7 Mapper Layer

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Mapper count | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 13 mapper files |
| Persistence mappers | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | 5 persistence mappers (Student, Staff, Attendance, Fee, Parent). 25+ domains missing. |
| OCR mappers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 2 OCR mappers (student, staff) |
| Configuration mappers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 4 configuration mappers |
| Shared utilities | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | `lib/mappers/shared.ts` |
| Duplicate mapping logic | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No duplicate mapping logic found in persistence mappers |

### Active Persistence Mappers
| Mapper | Used By |
|--------|---------|
| `StudentPersistenceMapper` | `StudentService` |
| `StaffPersistenceMapper` | `StaffService` |
| `AttendancePersistenceMapper` | `AttendanceService` |
| `FeePersistenceMapper` | `FeesService` |
| `ParentPersistenceMapper` | `ParentsService` |

---

## 1.8 Validation Layer

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Validator count | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 22 validator files |
| Active validators | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 13 validator sets actively used |
| Dead validators | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 5 validator sets in `validators/student/` dead at runtime |
| Partial validators | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | 2 validator sets in `validators/parent/` exported but not consumed |
| Split-brain schemas | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ❌ | Schemas duplicated across `validators/`, `lib/validation/`, and `dto/` |
| Single source of truth | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No single source of truth for validation schemas |

### Dead Validators (runtime)
| File | Evidence |
|------|----------|
| `validators/student/CreateStudentValidator.ts` | Only imported by test file. `StudentService` uses `dto/CreateStudentDTO.ts` instead. |
| `validators/student/UpdateStudentValidator.ts` | Only imported by test file. |
| `validators/student/BulkImportValidator.ts` | Only imported by test file. |
| `validators/student/OCRValidator.ts` | Only imported by test file. |
| `validators/student/index.ts` | Only imported by test file and `lib/validation/index.ts`. |

### Partial Validators
| File | Evidence |
|------|----------|
| `validators/parent/CreateParentValidator.ts` | Exported via `lib/validation/index.ts` but no service imports it at runtime. |
| `validators/parent/index.ts` | Exported via `lib/validation/index.ts` but no service imports it at runtime. |

---

## 1.9 Error Layer

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Error hierarchy | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | `lib/errors/AppError.ts` with subclasses: `NotFoundException`, `ValidationError`, `BusinessError`, `SubscriptionLimitException`, `RepositoryException` |
| Error middleware | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | `route-helpers/withErrorHandler.ts` wraps all routes |
| Stack trace logging | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | Stack traces logged server-side, not returned to client |
| Error response consistency | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | Some routes return raw `error.message` to client (security risk) |
| `console.error` in prod | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | Some `console.error` calls remain in production code |

---

## 1.10 Response Pattern

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Response helpers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | `lib/api/response.ts` exports `createSuccessResponse`, `createErrorResponse`, `createApiResponse` |
| Consistent usage | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | Most routes use helpers, but some return raw `Response` objects (e.g., `attendance/export/route.ts`) |
| Standard status codes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 200, 201, 400, 401, 403, 404, 500 used consistently |
| Response shape consistency | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | Some routes wrap data in `{ data, message }`, others return raw data |

---

## 1.11 Dependency Flow

| Item | Exists | Verified | Working | Wired | Duplicate | Missing | Evidence |
|------|--------|----------|---------|-------|-----------|---------|----------|
| Routes → Services | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ~70 routes call services. 49+ routes call repositories directly. |
| Services → Repositories | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | All services that have repositories use them correctly |
| Repositories → Firestore | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | All repositories use Firestore Admin SDK |
| No routes → Firestore | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 15 routes call `adminDb` directly |
| No services → Firestore | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 6 services call `adminDb` directly |

### Routes with Direct Firestore Access
| Route | Evidence |
|-------|----------|
| `app/api/v1/ledger/route.ts` | Uses `adminDb` directly for fee ledger queries |
| `app/api/v1/chat/route.ts` | Uses `adminDb` directly for chat messages |
| `app/api/v1/admin/users/route.ts` | Uses `adminDb` directly for user management |
| `app/api/v1/reports/generate/route.tsx` | Uses `adminDb` directly for report data |
| `app/api/v1/stripe/webhook/route.ts` | Uses `adminDb` directly for Stripe webhook handling |

---

## Architecture Violations

| # | Violation | File | Line | Severity |
|---|-----------|------|------|----------|
| 1 | 49+ routes bypass services, call repositories directly | Multiple routes | Multiple | HIGH |
| 2 | 15 routes call `adminDb` directly | Multiple routes | Multiple | HIGH |
| 3 | 6 services call `adminDb` directly | Multiple services | Multiple | HIGH |
| 4 | 27 of 34 services lack interfaces | `services/*.ts` | N/A | MEDIUM |
| 5 | 16 of 30 repositories lack interfaces | `repositories/*.ts` | N/A | MEDIUM |
| 6 | No application/use-case layer | Project-wide | N/A | MEDIUM |
| 7 | No DI container | Project-wide | N/A | LOW |
| 8 | `BaseService` exists but never extended | `services/base.service.ts` | 1-50 | LOW |
| 9 | Split-brain validation schemas | `validators/`, `lib/validation/`, `dto/` | Multiple | MEDIUM |
| 10 | Barrel exports incomplete | `services/index.ts`, `repositories/index.ts`, `types/index.ts` | Multiple | LOW |
| 11 | Business logic in repositories | `repositories/student.repository.ts`, `repositories/staff.repository.ts` | Multiple | HIGH |
| 12 | Service-to-service imports | `services/parents.service.ts`, `services/dashboard.service.ts` | Multiple | MEDIUM |
| 13 | Orphaned docs in root | `architecture-map.txt`, `dashboard-page.txt`, `PRODUCTION_READINESS_REPORT.md`, `RBAC-INVENTORY.md`, `saas-audit.txt`, `perms.txt` | Root | LOW |

---

## Dead Code

| Item | File | Evidence |
|------|------|----------|
| `BaseService` | `services/base.service.ts` | No service extends this abstract class |
| `IOCRService` | `interfaces/IOCRService.ts` | No class implements this interface |
| `StudentResponseDTO` | `dto/StudentResponseDTO.ts` | Exported but never imported |
| `StaffResponseDTO` | `dto/StaffResponseDTO.ts` | Exported but never imported |
| `ParentResponseDTO` | `dto/ParentResponseDTO.ts` | Exported but never imported |
| `FeeResponseDTO` | `dto/FeeResponseDTO.ts` | Exported but never imported |
| `OCRRequestDTO` | `dto/OCRRequestDTO.ts` | Exported but never imported |
| `validators/student/*` | `validators/student/CreateStudentValidator.ts`, `UpdateStudentValidator.ts`, `BulkImportValidator.ts`, `OCRValidator.ts`, `index.ts` | Only imported by test files; runtime uses `dto/` schemas |

---

## Duplicate Implementations

| Item | Files | Evidence |
|------|-------|----------|
| `job.service.ts` | `services/job.service.ts` and `lib/services/job.service.ts` | Byte-for-byte identical except comment |
| `configuration.service.ts` | `services/configuration.service.ts` and `services/configuration.application.service.ts` | Near-identical implementations |
| Validation schemas | `validators/`, `lib/validation/`, `dto/` | Same schemas defined in 3 locations |
| Student validators | `validators/student/*` and `dto/CreateStudentDTO.ts`, `dto/UpdateStudentDTO.ts` | Identical schemas, different locations |

---

## Architecture Score: 45/100

| Category | Score | Rationale |
|----------|-------|-----------|
| Layer Separation | 50/100 | Layers exist but are inconsistently enforced |
| Interface Coverage | 30/100 | Only 7 of 34 services, 14 of 30 repositories |
| Entity/Document/DTO/Mapper | 25/100 | Only 5 of 30 domains have complete stacks |
| Dependency Direction | 60/100 | Mostly inward but with notable exceptions |
| Dead Code | 40/100 | 8 dead implementations found |
| Duplication | 35/100 | 4 duplicate implementations found |
| Barrel Exports | 30/100 | Incomplete barrel exports across all index files |
| Consistency | 50/100 | Inconsistent patterns across modules |
