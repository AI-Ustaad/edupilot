# Architecture Gap Matrix

**Project:** EduPilot Enterprise Multi-Tenant School Management SaaS
**Date:** 2026-07-27
**Status:** VERIFIED — Based on current source code inspection and `tsc --noEmit`
**Baseline:** ENGINEERING_BASELINE_VERIFICATION.md

---

| Category | Expected | Current | Gap | Priority | Affected Files |
|----------|----------|---------|-----|----------|----------------|
| **Build Health** | | | | | |
| TypeScript compiles | `tsc --noEmit` passes | FAILS with 21+ errors | Missing module `@/validators/student`; test type mismatches | CRITICAL | `lib/validation/index.ts`, `__tests__/validators/all-validators.test.ts`, `repositories/assignment.repository.test.ts`, `repositories/audit.repository.test.ts`, `repositories/behavior.repository.test.ts`, `repositories/bus.repository.test.ts`, `repositories/configuration.repository.test.ts`, `repositories/fees.repository.test.ts`, `repositories/ledger.repository.test.ts`, `repositories/lesson-plan.repository.test.ts`, `repositories/marks.repository.test.ts`, `repositories/parents.repository.test.ts`, `repositories/quiz.repository.test.ts`, `repositories/user.repository.test.ts` |
| **Layer Separation** | | | | | |
| Routes call services only | All routes go through services | 24 routes bypass services, calling repositories directly | 24 routes violate dependency direction | HIGH | `app/api/v1/academic-year/[id]/route.ts`, `app/api/v1/academic-year/route.ts`, `app/api/v1/addons/route.ts`, `app/api/v1/admin/users/role/route.ts`, `app/api/v1/admin/users/route.ts`, `app/api/v1/admit-cards/bulk/route.ts`, `app/api/v1/audit/route.ts`, `app/api/v1/auth/parent-login/route.ts`, `app/api/v1/auth/register-user/route.ts`, `app/api/v1/certificate/route.ts`, `app/api/v1/chat/route.ts`, `app/api/v1/create-user/route.ts`, `app/api/v1/cron/fee-reminder/route.ts`, `app/api/v1/curriculum/upgrade/route.ts`, `app/api/v1/jobs/[jobId]/route.ts`, `app/api/v1/leave/arrange/route.ts`, `app/api/v1/leave/route.ts`, `app/api/v1/ledger/route.ts`, `app/api/v1/menu/route.ts`, `app/api/v1/reports/generate/route.tsx`, `app/api/v1/settings/general/route.ts`, `app/api/v1/syllabus/[id]/route.ts`, `app/api/v1/syllabus/route.ts`, `app/api/v1/users/init/route.ts` |
| Services use repositories only | No service calls adminDb directly | 1 service (`tenant.service.ts`) calls adminDb directly | 1 service bypasses repository layer | HIGH | `services/tenant.service.ts` |
| No business logic in repositories | Repositories contain only data access | Not fully verified in this run | Unknown | MEDIUM | All `repositories/*.ts` files |
| **Interface Coverage** | | | | | |
| All services implement interfaces | 37/37 services implement interfaces | 7/37 (18.9%) implement interfaces | 30 services lack formal contracts | HIGH | `services/AuditService.ts`, `services/OCRService.ts`, `services/ValidationService.ts`, `services/assignment.service.ts`, `services/auth.service.ts`, `services/behavior.service.ts`, `services/book.service.ts`, `services/bus.service.ts`, `services/claims.service.ts`, `services/class.service.ts`, `services/configuration.application.service.ts`, `services/configuration.service.ts`, `services/curriculum-engine.service.ts`, `services/featureFlag.service.ts`, `services/homework.service.ts`, `services/invoice.service.ts`, `services/job.service.ts`, `services/lesson-plan.service.ts`, `services/marks.service.ts`, `services/menu.service.ts`, `services/quiz.service.ts`, `services/report.service.ts`, `services/session.service.ts`, `services/subscription.service.ts`, `services/telemetry.service.ts`, `services/tenant-branding.service.ts`, `services/tenant.service.ts`, `services/timetable.service.ts`, `services/video-lecture.service.ts` |
| All repositories implement interfaces | 40/40 repositories implement interfaces | 27/40 (67.5%) implement interfaces | 13 repositories lack formal contracts | MEDIUM | `repositories/academic-year.repository.ts`, `repositories/class.repository.ts`, `repositories/curriculum.repository.ts`, `repositories/event-outbox.repository.ts`, `repositories/leave.repository.ts`, `repositories/ledger.repository.ts`, `repositories/section.repository.ts`, `repositories/settings.repository.ts`, `repositories/syllabus.repository.ts`, `repositories/tenant-branding.repository.ts`, `repositories/video-lecture.repository.ts` |
| All repositories extend BaseRepository | 40/40 repositories extend BaseRepository | 27/40 (67.5%) extend BaseRepository | 13 repositories do not extend BaseRepository | MEDIUM | `repositories/addons.repository.ts`, `repositories/chat.repository.ts`, `repositories/configuration.repository.ts`, `repositories/curriculum.repository.ts`, `repositories/dashboard-stats.repository.ts`, `repositories/event-outbox.repository.ts`, `repositories/feature-flag.repository.ts`, `repositories/job.repository.ts`, `repositories/menu.repository.ts`, `repositories/settings.repository.ts`, `repositories/user.repository.ts` |
| **Dependency Direction** | | | | | |
| Routes → Services → Repos → DB | Strict inward dependency flow | 24 routes → repositories (skipping services); 1 service → adminDb (skipping repositories) | Dependency direction violated at two layers | HIGH | 24 route files + `services/tenant.service.ts` |
| No service-to-service imports | Services are isolated | Not fully verified in this run | Unknown | MEDIUM | All `services/*.ts` files |
| **Barrel Exports** | | | | | |
| services/index.ts exports all services | 37/37 services exported | 6/37 (16.2%) exported | 31 services not barrel-exported | MEDIUM | `services/index.ts` |
| repositories/index.ts exports all repos | 40/40 repositories exported | 12/40 (30%) exported via object literal | 28 repositories not barrel-exported | MEDIUM | `repositories/index.ts` |
| interfaces/index.ts exports all interfaces | 35/35 interfaces exported | 12/35 (34.3%) exported | 23 interfaces not barrel-exported | MEDIUM | `interfaces/index.ts` |
| types/index.ts exports all types | 31/31 type files exported | 2/31 (6.5%) exported | 29 type files not barrel-exported | LOW | `types/index.ts` |
| **Dead Code** | | | | | |
| No dead DTO files | 0 dead DTO files | 0 dead DTO files exist | N/A — previous dead DTOs were removed | LOW | N/A |
| No dead validator files | 0 dead validator files | 0 dead validator files exist | N/A — previous dead validators were removed | LOW | N/A |
| No duplicate service implementations | 1 implementation per service | 2 duplicate job.service files; 1 dead duplicate config service | 3 duplicate/dead implementations | HIGH | `services/job.service.ts` vs `lib/services/job.service.ts`; `services/configuration.service.ts` vs `services/configuration.application.service.ts` |
| No broken imports | All imports resolve | `lib/validation/index.ts` imports from non-existent `validators/student` | 1 broken import causing build failure | CRITICAL | `lib/validation/index.ts` |
| **Validation** | | | | | |
| Single source of truth per domain | Each domain has validation in exactly one location | Student schemas in `dto/CreateStudentDTO.ts`; `lib/validation/index.ts` attempts to re-export from missing `validators/student/` | Split-brain validation + broken import | MEDIUM | `dto/CreateStudentDTO.ts`, `lib/validation/index.ts` |
| **Entity/DTO/Mapper Coverage** | | | | | |
| All domains have entity + DTO + mapper | 30+ domains with complete stacks | 5 domains have complete stacks (Student, Staff, Attendance, Fees, Parents) | 25+ domains missing entity/document/DTO/mapper layers | MEDIUM | All non-Student/Staff/Attendance/Fees/Parents domains |
| **Test Coverage** | | | | | |
| Unit tests for all services | >80% coverage | ~209 test files; many fail type-check; coverage unknown | Massive coverage gap + broken tests | HIGH | All `repositories/*.test.ts`, `__tests__/**/*.test.ts` |
| Architecture tests | Exist and pass | No architecture tests exist | 0 architecture tests | HIGH | N/A |
| **Security** | | | | | |
| All routes have auth + permissions | 118 routes with auth and permissions | 101 routes with `withAuth`; 77 with `withPermission` | 17 routes lack auth; 41 routes lack permission checks | HIGH | All `app/api/v1/**/*.ts` files |
| No hardcoded secrets | No secrets in codebase | Not verified in this run | Unknown | HIGH | All source files |
| **Consistency** | | | | | |
| Consistent parameter ordering | (tenantId, id, data, userId) | Not verified | Unknown | MEDIUM | All service methods |
| No `as any` casts | 0 `as any` casts | Not verified | Unknown | MEDIUM | All source files |
| Consistent error handling | All errors use AppError subclasses | Not verified | Unknown | MEDIUM | All route files |
| Consistent response shapes | All routes return { data, message } | Not verified | Unknown | MEDIUM | All route files |

---

## Summary

| Priority | Count | Categories |
|----------|-------|------------|
| CRITICAL | 2 | Build failure (broken import), 24 routes bypassing services + 1 service adminDb |
| HIGH | 5 | 30 services without interfaces, 13 repos without interfaces, no architecture tests, test type errors, duplicate services |
| MEDIUM | 7 | Incomplete barrel exports, 13 repos not extending BaseRepository, missing entity/DTO/mapper layers, inconsistent patterns, 17 routes without auth |
| LOW | 2 | Types barrel export, consistent parameter ordering |

---

## Verification Commands

All findings were verified using the following commands on the current working tree:

```bash
# Route counts and bypass analysis
find app/api/v1 -name 'route.ts' -o -name 'route.tsx' | wc -l
grep -rl 'from "@/repositories' app/api/v1/ | wc -l
grep -rl 'from "@/services' app/api/v1/ | wc -l

# adminDb usage
grep -r 'adminDb' app/api/v1/ --include='*.ts' --include='*.tsx'
grep -r 'adminDb' services/ --include='*.ts'

# Interface and BaseRepository coverage
grep -l 'implements I' services/*.ts | wc -l
grep -l 'implements I' repositories/*.ts | wc -l
grep -l 'extends BaseRepository' repositories/*.ts | wc -l

# Dead code verification
find dto -name 'StudentResponseDTO.ts' -o -name 'StaffResponseDTO.ts' -o -name 'ParentResponseDTO.ts' -o -name 'FeeResponseDTO.ts' -o -name 'OCRRequestDTO.ts'
find validators -type d -name student

# Broken imports
npx tsc --noEmit

# Barrel export coverage
cat services/index.ts
cat repositories/index.ts
cat interfaces/index.ts
cat types/index.ts

# Auth coverage
grep -rl 'withAuth' app/api/v1/ | wc -l
grep -rl 'withPermission' app/api/v1/ | wc -l
```
