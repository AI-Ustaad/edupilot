# EduPilot Enterprise Strategy Document 02: Root Cause Analysis

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Author**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Technical Leadership  
**Status**: Approved for Execution

---

## 1. Methodology

This root cause analysis (RCA) applies the "5 Whys" technique and systemic analysis to identify the fundamental causes behind the 91 verification gaps. Each root cause is assessed by its blast radius (number of gaps it explains), remediation effort, and strategic importance.

---

## 2. Root Cause Catalog

### Root Cause 1: Incomplete Architecture Enforcement

**Impact**: ~40 gaps across all categories  
**Blast Radius**: HIGH — affects architecture, security, testing, and maintainability

#### 5 Whys Analysis

1. **Why** do 49 routes call repositories directly?  
   Because there is no enforcement preventing this pattern.

2. **Why** is there no enforcement?  
   Because the gold standard pattern was established for Students and Staff but never formalized as a project-wide standard.

3. **Why** was it never formalized?  
   Because no lint rules, architecture tests, or code review checklists were created to enforce it.

4. **Why** were these not created?  
   Because the team prioritized feature velocity over architectural consistency during rapid development phases.

5. **Why** was architectural consistency deprioritized?  
   Because there was no CTO-level mandate or automated gates preventing deviations.

#### Evidence

- Only 2 of 12 modules follow gold standard (Students, Staff)
- 7 of 34 services implement interfaces (20%)
- 14 of 30 repositories implement interfaces (47%)
- 8 dead implementations (BaseService, IOCRService, 5 dead DTOs, 5 dead validators)
- 4 duplicate implementations (job.service.ts, configuration.service.ts, validation schemas, student validators)
- Split-brain validation across 3 locations

#### Remediation Tasks

1. Establish Architecture Enforcement Framework
   - ESLint custom rules for dependency direction
   - Architecture tests (Jest) that verify routes only import services
   - Code review checklist with architecture gate
   - CI pipeline integration

2. Complete Module Interfaces
   - Create interfaces for 27 services lacking them
   - Standardize method signatures
   - Add constructor injection verification

3. Implement Application/Use-Case Layer
   - Create use-case interfaces for cross-service orchestration
   - Define clear boundaries between application and domain layers

4. Remove Dead Code
   - Delete BaseService, IOCRService, 5 dead DTOs, 5 dead validators
   - Verify no imports reference removed code

5. Remove Duplicate Implementations
   - Consolidate job.service.ts duplicates
   - Consolidate configuration.service.ts duplicates
   - Merge validation schemas into single source of truth

6. Fix Dependency Direction
   - Refactor 49 routes to call services instead of repositories
   - Refactor 6 services to use repositories instead of adminDb
   - Verify dependency graph via architecture tests

#### Verification Criteria

- `npx tsc --noEmit` passes
- `npm run lint` passes with new architecture rules
- Architecture tests pass (zero violations)
- No direct adminDb calls outside repositories
- All services implement interfaces
- All repositories implement interfaces

---

### Root Cause 2: No Event-Driven Architecture Implementation

**Impact**: ~10 gaps  
**Blast Radius**: HIGH — affects notifications, audit, integrations, and decoupling

#### 5 Whys Analysis

1. **Why** are there 0 event publishers for core modules?  
   Because publishers were never implemented in the service layer.

2. **Why** were publishers never implemented?  
   Because the event bus was scaffolded with types and listeners but the integration point was missed.

3. **Why** was the integration missed?  
   Because event publishing was treated as a future task rather than part of the initial implementation.

4. **Why** was it deprioritized?  
   Because the team focused on CRUD functionality and deferred event infrastructure.

5. **Why** was it deferred indefinitely?  
   Because there was no sprint planning or architectural enforcement requiring event integration.

#### Evidence

- 14 event listeners exist but 9 are stubs
- Event bus exists but is in-memory only
- No event persistence or replay
- No error isolation
- Dead letter queue exists but is unprocessed
- No schema validation for events

#### Remediation Tasks

1. Implement Event Publishers
   - Add `EventBus.publish()` calls in StudentService, StaffService, AttendanceService, FeesService, ExamService
   - Define event contracts (type, payload, metadata)
   - Ensure all domain operations emit events

2. Harden Event Bus
   - Add event persistence (outbox pattern)
   - Implement error isolation (per-listener error boundaries)
   - Add schema validation (Zod) for all events
   - Process dead letter queue with retry logic

3. Implement Retry Logic
   - Exponential backoff for failed event processing
   - Dead letter queue for permanently failed events
   - Alerting on DLQ depth

#### Verification Criteria

- All domain events published from service layer
- Event listeners perform actual work (not stubs)
- Failed events retried automatically
- Events persist across restarts
- DLQ processed within 24 hours

---

### Root Cause 3: Background Jobs Not Deployed

**Impact**: ~8 gaps  
**Blast Radius**: HIGH — affects email, SMS, reports, and async operations

#### 5 Whys Analysis

1. **Why** are 0 of 7 workers running?  
   Because workers were implemented but never deployed to production.

2. **Why** were they never deployed?  
   Because deployment configuration was not included in the infrastructure setup.

3. **Why** was deployment configuration missing?  
   Because workers were built as a proof-of-concept without production rollout planning.

4. **Why** was there no rollout planning?  
   Because the team focused on API development and treated workers as secondary.

5. **Why** were workers secondary?  
   Because there was no product owner requirement or CTO mandate for operational excellence.

#### Evidence

- 7 workers defined (email, SMS, notification, report, export, AI, cleanup)
- 9 cron jobs defined with CRON_SECRET issues
- No job monitoring
- No retry alerts
- No notification queue (synchronous blocking)
- No notification templates
- No retry logic

#### Remediation Tasks

1. Deploy Workers
   - Containerize all 7 workers
   - Deploy to production infrastructure
   - Configure horizontal scaling

2. Job Monitoring
   - Dashboard for job status, throughput, failures
   - Alerting on job failure rate >5%
   - Retry alerting with exponential backoff

3. Secure Cron
   - Remove hardcoded CRON_SECRET fallback
   - Rotate committed secrets
   - Add cron job audit logging

#### Verification Criteria

- All 7 workers running in production
- Jobs complete successfully with <1% failure rate
- Failed jobs retried with backoff
- Monitoring dashboard operational
- No hardcoded secrets in codebase

---

### Root Cause 4: Security Gaps in Middleware/Routes

**Impact**: ~12 gaps  
**Blast Radius**: CRITICAL — affects all users and tenants

#### 5 Whys Analysis

1. **Why** do 3 routes have no auth?  
   Because auth middleware was not applied during route creation.

2. **Why** was auth not applied?  
   Because the auth middleware requires explicit application per route and was missed.

3. **Why** was it missed?  
   Because there was no automated check or lint rule enforcing auth on all routes.

4. **Why** were permission checks inconsistent?  
   Because permission checks were added manually per route without a standardized pattern.

5. **Why** is session validation weak?  
   Because the auth implementation checks cookie existence only, not validity or expiration.

#### Evidence

- 3 routes with NO auth (curriculum/engine, education/rules, ocr/extract)
- 12 routes lacking permission checks
- Session cookie checks existence only
- ID token fallback creates security risk
- No refresh tokens (5-day expiration)
- No CSRF tokens
- No password reset
- No MFA/2FA
- No account lockout
- Role escalation vulnerability in register-user
- CRON_SECRET hardcoded fallback + committed
- getTeacherClasses tenant leak

#### Remediation Tasks

1. Harden Auth Middleware
   - Validate session cookies server-side (not just existence)
   - Implement refresh token rotation
   - Add server-side session invalidation
   - Remove ID token fallback

2. Complete Permission Coverage
   - Add auth to 3 unprotected routes
   - Add permission checks to 12 routes
   - Standardize permission enforcement pattern

3. Fix Tenant Isolation
   - Fix getTeacherClasses cross-tenant leak
   - Add tenant-level encryption consideration
   - Implement tenant-scoped query verification

4. Secure Secrets Management
   - Remove CRON_SECRET from .env.local
   - Rotate all exposed secrets
   - Implement secrets management best practices

#### Verification Criteria

- All 118 routes have proper auth and permission checks
- Session cookies validated server-side
- Refresh tokens implemented with rotation
- No cross-tenant data leaks
- No secrets in codebase
- CSRF protection active

---

### Root Cause 5: Testing Strategy Not Implemented

**Impact**: ~10 gaps  
**Blast Radius**: HIGH — affects quality, regression prevention, and deployment confidence

#### 5 Whys Analysis

1. **Why** is test coverage only 5%?  
   Because only unit tests for utilities were implemented.

2. **Why** were no integration tests written?  
   Because there was no test database or test environment setup.

3. **Why** was there no test environment?  
   Because the team prioritized feature development over testing infrastructure.

4. **Why** were no E2E tests written?  
   Because Playwright/Cypress was not configured and no E2E framework was selected.

5. **Why** is there no testing strategy?  
   Because testing was treated as an afterthought rather than a first-class engineering practice.

#### Evidence

- 209 tests exist, all passing
- ~5% code coverage
- No integration tests
- No E2E tests
- No auth tests
- No tenant isolation tests
- No RBAC tests

#### Remediation Tasks

1. Implement Testing Strategy
   - Set up test database (Firebase emulators or test project)
   - Configure test environment variables
   - Establish testing conventions

2. Integration Tests
   - Auth flow tests (login, logout, refresh)
   - Tenant isolation tests
   - RBAC permission tests
   - API endpoint tests for all critical paths

3. E2E Tests
   - Critical user journeys (enrollment, attendance, fees)
   - Admin workflows
   - Multi-tenant scenarios

#### Verification Criteria

- Integration tests cover all critical paths
- E2E tests cover login, create student, mark attendance, generate report
- Test coverage >80% for new code
- All tests pass in CI

---

### Root Cause 6: Technical Debt Accumulation

**Impact**: ~11 gaps  
**Blast Radius**: MEDIUM — affects maintainability and velocity

#### 5 Whys Analysis

1. **Why** is there dead code?  
   Because features were removed or refactored but their implementations were not cleaned up.

2. **Why** are there duplicates?  
   Because multiple engineers implemented similar functionality without coordination.

3. **Why** is there split-brain validation?  
   Because validation was added in routes, services, and repositories independently.

4. **Why** is business logic in repositories?  
   Because the repository pattern was not strictly enforced.

5. **Why** is there service-to-service import coupling?  
   Because the dependency direction was not defined or enforced.

#### Evidence

- Dead code: BaseService, IOCRService, 5 dead DTOs, 5 dead validators
- Duplicates: job.service.ts, configuration.service.ts, validation schemas, student validators
- Split-brain validation across 3 locations
- Incomplete barrel exports
- Business logic in repositories
- Service-to-service imports violating dependency direction

#### Remediation Tasks

1. Systematic Technical Debt Reduction
   - Remove dead code
   - Remove duplicates
   - Consolidate validation schemas
   - Complete barrel exports
   - Enforce dependency direction

#### Verification Criteria

- No dead code remains
- No duplicate implementations
- Validation exists in exactly one location per domain
- Barrel exports complete
- Dependency direction verified by architecture tests

---

## 3. Gap Mapping

| Gap Category | Gap Count | Root Cause | Remediation Epic |
|-------------|-----------|------------|------------------|
| Architecture | ~40 | RC1: Architecture Enforcement | Epic 1 |
| Security | ~12 | RC4: Security Gaps | Epic 2 |
| Platform | ~10 | RC2: Events + RC3: Jobs | Epic 3 |
| Data & Compliance | ~10 | RC2: Events + RC4: Security | Epic 4, 7 |
| Testing | ~10 | RC5: Testing Strategy | Epic 7 |
| Module Completion | ~12 | RC1: Architecture + RC6: Debt | Epic 4 |
| Commercial | ~8 | RC6: Debt | Epic 5 |
| AI | ~8 | RC3: Jobs + RC6: Debt | Epic 6 |

---

## 4. Remediation Priority Matrix

| Root Cause | Blast Radius | Remediation Effort | Priority | Epic |
|-----------|-------------|-------------------|----------|------|
| RC1: Architecture Enforcement | 40 gaps | High | P0 | Epic 1 |
| RC2: No Event Implementation | 10 gaps | Medium | P0 | Epic 3 |
| RC3: Jobs Not Deployed | 8 gaps | Medium | P0 | Epic 3 |
| RC4: Security Gaps | 12 gaps | High | P0 | Epic 2 |
| RC5: Testing Strategy | 10 gaps | High | P1 | Epic 7 |
| RC6: Technical Debt | 11 gaps | Medium | P1 | All Epics |

---

## 5. Conclusion

The 91 verification gaps trace back to 6 root causes. Three of these (Architecture Enforcement, Security Gaps, Event/Job Implementation) account for approximately 58 of 91 gaps and are classified P0. Addressing these root causes through the 10-sprint plan will eliminate the majority of identified gaps and establish a foundation for sustainable enterprise development.
