# Gap Analysis

**Project:** EduPilot Enterprise Multi-Tenant AI-Native School Management SaaS Platform
**Date:** 2026-07-27
**Status:** CRITICAL GAPS IDENTIFIED
**Target Architecture:** Route → Validation → DTO → Service → Repository → Firestore

---

## Gap Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 — CRITICAL | 12 | Blocks production deployment, security vulnerabilities |
| P1 — HIGH | 28 | Major architectural violations, maintainability risk |
| P2 — MEDIUM | 31 | Technical debt, standardization gaps |
| P3 — LOW | 17 | Nice-to-have improvements |
| **TOTAL** | **88** | |

---

## P0 — CRITICAL Gaps

These gaps represent immediate security, stability, or compliance risks that MUST be resolved before production.

| # | Gap | Current State | Expected State | Impact | Evidence |
|---|-----|---------------|---------------|--------|----------|
| 1 | Routes bypassing services | 40 routes import repos directly | All routes call services | Business logic scattered, no transaction boundary | Route audit: 25 repos-only + 15 mixed |
| 2 | Direct Firestore access in routes | 9 routes import `@/lib/firebase-admin` | Zero routes access Firestore | Complete bypass of service/repository layer | Route audit: 9 files |
| 3 | Direct Firestore access in services | 6 services import `@/lib/firebase-admin` | Zero services access Firestore | Repository pattern violated | Service audit: auth, session, claims, assignment, tenant, lib/services/job |
| 4 | Business logic in repositories | 11 repositories contain orchestration/aggregation | Repositories contain only CRUD | Violates SRP, untestable business rules | Repository audit: 11 files |
| 5 | Duplicate service implementations | `services/job.service.ts` vs `lib/services/job.service.ts` | Single implementation per service | Inconsistent behavior, maintenance burden | File system: both exist |
| 6 | Dead service file | `services/configuration.application.service.ts` never imported | Zero dead service files | Orphaned code, confusion | Grep: zero imports |
| 7 | Service interface coverage | 7/38 services (18.4%) | 38/38 services (100%) | No contract testing, tight coupling | Service audit |
| 8 | Repository interface coverage | 27/39 repositories (69.2%) | 39/39 repositories (100%) | Incomplete contracts | Repository audit: 12 missing |
| 9 | Repository BaseRepository coverage | 27/39 repositories (69.2%) | 39/39 repositories (100%) | Inconsistent CRUD implementation | Repository audit: 12 missing |
| 10 | Missing IUserRepository interface | Defined inline in `user.repository.ts` | Standalone `interfaces/IUserRepository.ts` | Not exported from barrel, inconsistent | File system check |
| 11 | Build broken (pre-Sprint 0) | `tsc --noEmit` failed with 21+ errors | Clean compilation | Blocks CI/CD | TypeScript errors |
| 12 | Test infrastructure broken | 15 test suites fail due to mock issues | All tests pass | Blocks CI/CD | Jest output |

---

## P1 — HIGH Gaps

These gaps represent significant architectural violations that increase risk and reduce maintainability.

| # | Gap | Current State | Expected State | Impact | Evidence |
|---|-----|---------------|---------------|--------|----------|
| 13 | Service-to-service coupling | 21 services import other services | Services communicate via events or orchestration layer | Tight coupling, circular dependency risk | Service audit |
| 14 | Missing constructor injection | 10 services instantiate dependencies inline | All services use constructor injection | Hard to test, hidden dependencies | Service audit |
| 15 | Routes without auth | 17 routes lack `withAuth` | 0 routes without auth | Unauthorized access | Route audit |
| 16 | Routes without permission | 41 routes lack `withPermission` | All protected routes have RBAC | Privilege escalation risk | Route audit |
| 17 | Stub routes | 17 routes import neither services nor repos | All routes have implementations | Dead endpoints, security surface | Route audit |
| 18 | Split-brain validation | Student schemas in `dto/` and `lib/validation/` | Single source of truth per domain | Inconsistent validation, maintenance burden | Validation audit |
| 19 | Missing barrel exports | services/index: 6/37, repos/index: 12/40, interfaces/index: 12/35 | Complete barrel exports | Import inconsistency | File system check |
| 20 | Inconsistent parameter ordering | Not standardized | `(tenantId, id, data, userId)` | Developer confusion, bugs | Code review |
| 21 | `as any` casts | Present in codebase | Zero `as any` casts | Type safety erosion | Code search |
| 22 | No architecture tests | Zero tests enforcing dependency rules | Tests verify Route→Service→Repo→DB | No automated compliance | Test directory |
| 23 | No CI architecture gates | No lint rules for dependency direction | CI blocks violations | Violations accumulate | CI config |
| 24 | Event system non-functional | 14 listeners exist, 9 are stubs | All listeners perform actual work | No decoupling | Event audit |
| 25 | Background jobs not deployed | 7 workers defined, 0 running | All workers deployed | Async operations blocked | Worker audit |
| 26 | Audit coverage incomplete | ~40% of service methods audited | >80% coverage | Compliance risk | Audit audit |
| 27 | No read operation audit | Only write operations logged | All sensitive reads logged | Security blind spot | Audit audit |
| 28 | No login/logout audit | Auth events not tracked | Auth events in audit log | Cannot trace access | Audit audit |
| 29 | No payment audit | Payment events not logged | All financial events logged | Financial compliance risk | Audit audit |
| 30 | No AI content moderation | No moderation layer | All AI outputs moderated | Safety risk | AI audit |
| 31 | No AI fallback | No fallback triggers | Fallback on API failure | Reliability risk | AI audit |
| 32 | No job monitoring | No dashboard | Operations can monitor jobs | Silent failures | Worker audit |
| 33 | No job retry logic | No retry mechanism | Exponential backoff retry | Failed jobs lost | Worker audit |
| 34 | No notification queue | Synchronous blocking | Async queue | Performance risk | Notification audit |
| 35 | No notification templates | Inconsistent messages | Templated notifications | UX inconsistency | Notification audit |
| 36 | No event persistence | In-memory only | Outbox pattern with persistence | Events lost on restart | Event audit |
| 37 | No event error isolation | Cascade failures possible | Per-listener error boundaries | One failure blocks all | Event audit |
| 38 | No DLQ processing | DLQ exists but unprocessed | DLQ processed within 24h | Data loss | Event audit |
| 39 | No event schema validation | No Zod validation | All events validated | Invalid events possible | Event audit |
| 40 | Hardcoded CRON_SECRET | Present in codebase | Environment variable only | Security vulnerability | Security audit |

---

## P2 — MEDIUM Gaps

These gaps represent technical debt and standardization opportunities.

| # | Gap | Current State | Expected State | Impact |
|---|-----|---------------|---------------|--------|
| 41-47 | 10 modules missing interfaces | Attendance, Parents, Fees, Academics, etc. | All modules have interfaces | Maintainability |
| 48-53 | No integration tests | Zero integration tests | Coverage for all critical paths | Quality |
| 54-59 | No E2E tests | Zero E2E tests | Critical user journeys covered | Quality |
| 60-65 | Missing entity/DTO/mapper layers | Only 5 domains have complete stacks | All 30+ domains have complete stacks | Type safety |
| 66-70 | Inconsistent error handling | Mixed patterns | All errors use AppError subclasses | Debugging |
| 71-75 | Inconsistent response shapes | Mixed `{data}`, `{success}`, etc. | Standard `{data, message}` | Client consistency |
| 76-80 | Missing tenant encryption | Shared schema | Tenant-level encryption | Data isolation |
| 81-85 | No subscription analytics | No metrics | Subscription metrics dashboard | Business insights |
| 86-88 | No tenant data export | No export functionality | GDPR-compliant export | Compliance |

---

## P3 — LOW Gaps

| # | Gap | Current State | Expected State | Impact |
|---|-----|---------------|---------------|--------|
| 89-91 | Cache key collisions possible | No documented strategy | Cache key namespacing | Risk |
| 92-94 | No dunning logic | No dunning workflow | Automated dunning | Revenue |
| 95-97 | No unsubscribe links | Missing compliance | Unsubscribe in emails | Compliance |
| 98-100 | No circuit breaker | No resilience | Circuit breaker for external calls | Reliability |
| 101-103 | No job priority | FIFO only | Priority queues | Performance |
| 104-106 | No A/B testing for prompts | Single prompt version | Prompt experimentation | Optimization |
| 107-109 | No fine-tuning | Base models only | Domain fine-tuning | Quality |
| 110-112 | No permission inheritance | Flat permissions | Hierarchical permissions | Maintenance |
| 113-115 | No snapshotting | No snapshots | Event snapshots for recovery | Recovery |
| 116-118 | No job metrics | No metrics | Job throughput metrics | Observability |

---

## Gap Distribution by Layer

| Layer | P0 | P1 | P2 | P3 | Total |
|-------|----|----|----|----|-------|
| Routes | 4 | 6 | 0 | 0 | 10 |
| Services | 3 | 4 | 0 | 0 | 7 |
| Repositories | 3 | 0 | 0 | 0 | 3 |
| Architecture | 2 | 8 | 0 | 0 | 10 |
| Security | 2 | 4 | 2 | 2 | 10 |
| Events | 2 | 3 | 2 | 2 | 9 |
| Jobs | 2 | 2 | 1 | 1 | 6 |
| Testing | 1 | 2 | 5 | 0 | 8 |
| Validation | 0 | 1 | 3 | 0 | 4 |
| AI | 0 | 3 | 2 | 2 | 7 |
| Notifications | 0 | 2 | 3 | 3 | 8 |
| Modules | 0 | 1 | 8 | 2 | 11 |
| Subscription | 0 | 0 | 3 | 1 | 4 |
| Tenant | 0 | 0 | 3 | 2 | 5 |
| Audit | 0 | 3 | 0 | 1 | 4 |

---

## Critical Path to Compliance

```
Sprint 0: Build Fix (COMPLETE)
    ↓
Sprint 1: Remove duplicates, fix route bypasses, complete barrel exports
    ↓
Sprint 2: Create all service/repository interfaces, enforce constructor injection
    ↓
Sprint 3: Move business logic from repositories to services
    ↓
Sprint 4: Fix direct Firestore access in services, create missing repositories
    ↓
Sprint 5: Create missing services for routes that bypass
    ↓
Sprint 6: Consolidate validation schemas
    ↓
Sprint 7: Add architecture tests and CI gates
    ↓
COMPLIANCE ACHIEVED
```
