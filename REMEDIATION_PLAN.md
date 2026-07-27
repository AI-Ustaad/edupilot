# Remediation Plan

**Project:** EduPilot Enterprise Multi-Tenant AI-Native School Management SaaS Platform
**Date:** 2026-07-27
**Status:** READY FOR EXECUTION
**Based on:** ARCHITECTURE_COMPLIANCE_REPORT.md, GAP_ANALYSIS.md

---

## Remediation Strategy

The remediation is organized into **7 sprints** targeting P0 and P1 gaps first. Each sprint is independent and delivers a verifiable architectural improvement.

**Total Estimated Effort:** 86 story points (~17 weeks with 4 engineers)

---

## Sprint 1: Dead Code & Duplicate Elimination (Week 1-2)

### Objective
Remove architectural dead weight that creates confusion and maintenance burden.

### Scope
1. Remove `lib/services/job.service.ts` (duplicate)
2. Remove `services/configuration.application.service.ts` (dead code)
3. Remove 17 stub routes (import neither services nor repos)
4. Clean up any remaining dead imports

### Files to Modify
| Action | File |
|--------|------|
| DELETE | `lib/services/job.service.ts` |
| DELETE | `services/configuration.application.service.ts` |
| DELETE/REFACTOR | 17 stub route files |

### Dependencies
- None

### Risk
LOW — Deleting unused code has zero runtime impact.

### Verification
- `npm run build` passes
- `npm test` passes
- `grep -r "configuration.application.service"` returns zero results
- `find lib/services/job.service.ts` returns "not found"

---

## Sprint 2: Service Interface Coverage (Week 3-4)

### Objective
Create interfaces for all 31 services that lack them.

### Scope
1. Create `I{ServiceName}` interface for each service
2. Update service class declarations to implement interfaces
3. Update `interfaces/index.ts` barrel exports
4. Verify all 38 services implement interfaces

### Files to Create
| Interface | Service |
|-----------|---------|
| `interfaces/IAuditService.ts` | AuditService |
| `interfaces/IAuthService.ts` | auth.service |
| `interfaces/IClassService.ts` | class.service |
| `interfaces/IConfigurationService.ts` | configuration.service |
| `interfaces/ICurriculumEngineService.ts` | curriculum-engine.service |
| `interfaces/IFeatureFlagService.ts` | featureFlag.service |
| `interfaces/IHomeworkService.ts` | homework.service |
| `interfaces/IInvoiceService.ts` | invoice.service |
| `interfaces/IJobService.ts` | job.service |
| `interfaces/ILessonPlanService.ts` | lesson-plan.service |
| `interfaces/IMarksService.ts` | marks.service |
| `interfaces/IMenuService.ts` | menu.service |
| `interfaces/IOCRService.ts` | OCRService |
| `interfaces/IQuizService.ts` | quiz.service |
| `interfaces/IReportService.ts` | report.service |
| `interfaces/ISessionService.ts` | session.service |
| `interfaces/ISubscriptionService.ts` | subscription.service |
| `interfaces/ITelemetryService.ts` | telemetry.service |
| `interfaces/ITenantBrandingService.ts` | tenant-branding.service |
| `interfaces/ITenantService.ts` | tenant.service |
| `interfaces/ITimetableService.ts` | timetable.service |
| `interfaces/IValidationService.ts` | ValidationService |
| `interfaces/IVideoLectureService.ts` | video-lecture.service |
| `interfaces/IBookService.ts` | book.service |
| `interfaces/IBusService.ts` | bus.service |
| `interfaces/IClaimsService.ts` | claims.service |
| `interfaces/IAIAgentService.ts` | ai/exam.service |
| `interfaces/IAITimetableService.ts` | ai/timetable.service |

### Files to Modify
- All 31 service files (add `implements I...`)
- `interfaces/index.ts` (add barrel exports)

### Dependencies
- Sprint 1 complete

### Risk
MEDIUM — Large surface area, but mechanical changes.

### Verification
- `grep -l 'implements I' services/*.ts` returns 38 files
- `npm run type-check` passes
- `npm test` passes

---

## Sprint 3: Repository Interface & BaseRepository Coverage (Week 5-6)

### Objective
Create interfaces for all 12 non-compliant repositories and ensure all extend BaseRepository.

### Scope
1. Create `I{RepositoryName}` interface for 12 repositories
2. Refactor 8 repositories to extend BaseRepository while preserving custom logic
3. Refactor 3 repositories to extend BaseRepository and implement interfaces
4. Create `interfaces/IUserRepository.ts` (move from inline)

### Files to Create
| Interface | Repository |
|-----------|------------|
| `interfaces/IAcademicYearRepository.ts` | academic-year.repository |
| `interfaces/IClassRepository.ts` | class.repository |
| `interfaces/ICurriculumRepository.ts` | curriculum.repository |
| `interfaces/IEventOutboxRepository.ts` | event-outbox.repository |
| `interfaces/ILeaveRepository.ts` | leave.repository |
| `interfaces/ILedgerRepository.ts` | ledger.repository |
| `interfaces/ISectionRepository.ts` | section.repository |
| `interfaces/ISettingsRepository.ts` | settings.repository |
| `interfaces/ISyllabusRepository.ts` | syllabus.repository |
| `interfaces/ITenantBrandingRepository.ts` | tenant-branding.repository |
| `interfaces/IVideoLectureRepository.ts` | video-lecture.repository |
| `interfaces/IUserRepository.ts` | user.repository (move inline) |

### Files to Modify
- 12 repository files (add `extends BaseRepository` and/or `implements I...`)
- `repositories/base.repository.ts` (if needed for new patterns)
- `interfaces/index.ts` (add barrel exports)

### Dependencies
- Sprint 2 complete

### Risk
HIGH — Changing repository inheritance may break custom logic. Must preserve existing behavior.

### Verification
- `grep -l 'extends BaseRepository' repositories/*.ts` returns 39 files (excluding index.ts, base.repository.ts)
- `grep -l 'implements I' repositories/*.ts` returns 39 files
- `npm run build` passes

---

## Sprint 4: Direct Firestore Access Elimination (Week 7-8)

### Objective
Eliminate all direct Firestore access from services and routes.

### Scope
1. Fix `services/tenant.service.ts` — use TenantRepository instead of adminDb
2. Fix `services/auth.service.ts` — use UserRepository/ClaimsRepository instead of adminAuth
3. Fix `services/session.service.ts` — use repository instead of adminAuth
4. Fix `services/claims.service.ts` — use repository instead of adminAuth
5. Fix `services/assignment.service.ts` — use repository instead of adminStorage
6. Fix `lib/services/job.service.ts` — DELETE (Sprint 1)
7. Fix 9 routes with direct Firestore access — delegate to services
8. Create missing repositories if needed (e.g., SessionRepository, ClaimsRepository)

### Files to Modify
| Service | Change |
|---------|--------|
| `services/tenant.service.ts` | Replace adminDb with TenantRepository |
| `services/auth.service.ts` | Replace adminAuth with UserRepository |
| `services/session.service.ts` | Replace adminAuth with SessionRepository |
| `services/claims.service.ts` | Replace adminAuth with ClaimsRepository |
| `services/assignment.service.ts` | Replace adminStorage with AssignmentRepository |
| 9 route files | Remove `@/lib/firebase-admin` imports, call services |

### Files to Create
- `repositories/session.repository.ts` (if not exists)
- `repositories/claims.repository.ts` (if not exists)

### Dependencies
- Sprint 2 complete (interfaces established)
- Sprint 3 complete (repositories standardized)

### Risk
HIGH — Changing auth/session/claims services affects authentication flow. Must be done carefully.

### Verification
- `grep -r "adminDb\|adminAuth\|adminStorage" services/` returns zero results
- `grep -r "adminDb\|adminAuth\|adminStorage" app/api/v1/` returns zero results
- `npm run build` passes
- Auth flow tests pass

---

## Sprint 5: Route Dependency Direction Fix (Week 9-10)

### Objective
Refactor all 40 routes that bypass services to use the service layer.

### Scope
1. Create missing services for domains without services
2. Refactor 25 routes that import repos only
3. Refactor 15 routes that import both services and repos
4. Remove direct repository imports from all routes

### Services to Create
| Service | For Routes |
|---------|-----------|
| AcademicYearService | academic-year, users/register-school |
| AddonsService | addons |
| UserService (or extend existing) | admin/users, admin/users/role, create-user, users/init |
| CertificateService | certificate |
| ChatService | chat |
| CurriculumUpgradeService | curriculum/upgrade |
| LedgerService | ledger |
| MenuService | menu |
| ReportService | reports/generate |
| SyllabusService | syllabus, syllabus/[id] |
| SettingsService | settings/general |
| LeaveService | leave, leave/arrange |
| JobService | jobs/[jobId] |
| FeeReminderService | cron/fee-reminder, jobs/fee-reminder |

### Files to Modify
- 40 route files (replace repo imports with service imports)
- Service files (ensure they exist and have correct methods)

### Dependencies
- Sprint 3 complete (repositories standardized)
- Sprint 4 complete (direct Firestore access eliminated)

### Risk
HIGH — Refactoring 40 routes risks breaking API contracts. Each route must be individually tested.

### Verification
- `grep -r 'from "@/repositories' app/api/v1/` filtered by no `from "@/services"` returns zero results
- `npm run build` passes
- All route tests pass

---

## Sprint 6: Business Logic Migration (Week 11-12)

### Objective
Move all business logic from repositories to services.

### Scope
1. For each of the 11 repositories with business logic, create corresponding service methods
2. Update routes to call services instead of repositories directly
3. Simplify repositories to pure CRUD

### Business Logic to Migrate

| Repository | Logic | Target Service |
|------------|-------|----------------|
| `academic-year.repository.ts` | `setCurrent()` — state transition | AcademicYearService |
| `ai-usage.repository.ts` | `getUsageStats()` — aggregation | AnalyticsService |
| `dashboard-stats.repository.ts` | `incrementCounter()` — atomic update | DashboardService |
| `event-outbox.repository.ts` | Outbox pattern | EventBusService |
| `fees.repository.ts` | `getTotalRevenue()` — aggregation | FeesService |
| `invoice.repository.ts` | `markAsPaid()` — state transition | InvoiceService |
| `job.repository.ts` | `updateProgress()`, `failJob()` | JobService |
| `section.repository.ts` | `createMissingStructure()` | ClassService |
| `settings.repository.ts` | `saveConfigurationWithHistory()` | ConfigurationService |
| `student.repository.ts` | `countByClass()` — aggregation | StudentService |
| `subscription.repository.ts` | `activate()`, `cancel()` | SubscriptionService |
| `user.repository.ts` | `findByUidWithFallback()` | AuthService |

### Files to Modify
- 11 repository files (simplify to CRUD only)
- 12 service files (add business logic methods)
- Route files that call repository methods directly

### Dependencies
- Sprint 5 complete (routes use services)

### Risk
HIGH — Moving business logic changes behavior. Must preserve exact semantics.

### Verification
- Each repository contains only CRUD methods
- Each service contains the migrated business logic
- All tests pass
- `npm run build` passes

---

## Sprint 7: Architecture Enforcement (Week 13-14)

### Objective
Implement automated architecture enforcement to prevent regression.

### Scope
1. Create architecture tests (Jest) verifying:
   - Routes only import services (not repositories or Firestore)
   - Services only import repositories (not Firestore)
   - Repositories only import Firestore (via BaseRepository)
2. Add ESLint custom rules or `eslint-plugin-import` config
3. Add CI pipeline stage that runs architecture tests
4. Create architecture documentation

### Files to Create
- `__tests__/architecture/route-dependencies.test.ts`
- `__tests__/architecture/service-dependencies.test.ts`
- `__tests__/architecture/repository-dependencies.test.ts`
- `.eslintrc.json` updates (if needed)

### Files to Modify
- `package.json` (add architecture test script)
- CI configuration (add architecture test stage)

### Dependencies
- Sprint 6 complete (architecture clean)

### Risk
LOW — Adding tests and CI config has no runtime impact.

### Verification
- Architecture tests pass
- CI pipeline runs architecture tests
- Any new violation causes CI to fail

---

## Execution Order

```
Sprint 1 (Dead Code) → Sprint 2 (Service Interfaces) → Sprint 3 (Repo Interfaces)
       ↓                      ↓                              ↓
Sprint 4 (Firestore Fix) → Sprint 5 (Route Fixes) → Sprint 6 (Logic Migration)
       ↓                      ↓                              ↓
       └──────────────────────┴──────────────────────────────┘
                              ↓
                       Sprint 7 (Enforcement)
```

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Routes calling services only | 118/118 (100%) |
| Services accessing Firestore directly | 0 |
| Repositories with business logic | 0 |
| Services implementing interfaces | 38/38 (100%) |
| Repositories implementing interfaces | 39/39 (100%) |
| Repositories extending BaseRepository | 39/39 (100%) |
| Duplicate code | 0 |
| Dead code | 0 |
| Architecture tests | Pass with zero violations |
| Build | `npm run build` passes |
| Tests | `npm test` passes |
