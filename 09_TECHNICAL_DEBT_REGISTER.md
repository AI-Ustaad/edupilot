# EduPilot Enterprise Strategy Document 09: Technical Debt Register

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Author**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Technical Leadership  
**Status**: Approved for Execution

---

## 1. Technical Debt Overview

Technical debt represents the cumulative cost of suboptimal architectural decisions, shortcuts, and incomplete implementations. This register catalogs all identified debt, quantifies its impact, and defines the payoff plan.

### Debt Summary

| Metric | Value |
|--------|-------|
| Total Debt Items | 15 |
| Total Principal Effort | ~178 days |
| Total Ongoing Interest | High |
| P0 Items (Principal) | 85 days |
| P1 Items (Principal) | 75 days |
| P2 Items (Principal) | 18 days |

---

## 2. Debt Register

### TD-01: Missing Service Interfaces (27 services)

**Principal**: 20 days  
**Interest**: HIGH — no contract enforcement, prevents refactoring, increases bug surface  
**Priority**: P0  
**Category**: Architecture  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1-2

**Description**: 27 of 34 services lack TypeScript interfaces, preventing compile-time contract enforcement and making refactoring risky.

**Impact**:
- No guarantee of method signatures
- Difficult to mock in tests
- Inconsistent implementations
- Hard to understand service boundaries

**Remediation**:
1. Create interfaces for all 27 services
2. Standardize method signatures
3. Add constructor injection verification
4. Enforce via architecture tests

**Evidence**:
- 7 of 34 services implement interfaces (20%)
- Services without interfaces: Attendance, Parents, Fees, Dashboard, Analytics, Library, Transport, Hostel, Communication, and 18 others

**Verification**:
- All services compile against their interfaces
- Architecture tests verify interface implementation

---

### TD-02: Missing Entity/DTO/Mapper Stacks (25 domains)

**Principal**: 25 days  
**Interest**: HIGH — no type safety, manual mapping errors, inconsistent data shapes  
**Priority**: P0  
**Category**: Architecture  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1-6

**Description**: 25 of 30 domains lack complete entity/DTO/mapper stacks, leading to inconsistent data shapes and manual mapping errors.

**Impact**:
- Type safety gaps
- Runtime mapping errors
- Inconsistent API contracts
- Difficult to validate data flow

**Remediation**:
1. Create entities for all 25 domains
2. Create DTOs (request/response) for all entities
3. Create persistence mappers for all entities
4. Enforce mapper usage in services

**Evidence**:
- Only 5 of 30 domains have complete stacks (Students, Staff, Class, Section, User)
- Domains without stacks: Attendance, Parents, Fees, Exam, Assignment, Homework, Mark, Syllabus, Timetable, Subject, and 15 others

**Verification**:
- TypeScript strict mode passes
- No manual property mapping in services

---

### TD-03: Routes Bypassing Services (49 routes)

**Principal**: 15 days  
**Interest**: HIGH — bypasses business logic, bypasses validation, bypasses audit  
**Priority**: P0  
**Category**: Architecture  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1

**Description**: 49 API routes call repositories directly instead of going through services, bypassing all business logic, validation, and audit.

**Impact**:
- Business logic not enforced
- Validation skipped
- Audit gaps
- Security vulnerabilities

**Remediation**:
1. Create service methods for all direct repository calls
2. Refactor routes to use services
3. Enforce via architecture tests

**Evidence**:
- 49+ routes in app/api/v1/**/*.ts call repositories directly
- Affected modules: Attendance, Parents, Fees, Academics, Library, Transport, Hostel, Communication

**Verification**:
- Architecture tests verify no repository imports in routes
- `grep -r "repositories/" app/api/v1` returns zero matches

---

### TD-04: Direct adminDb Calls (21 total)

**Principal**: 10 days  
**Interest**: HIGH — bypasses repositories, hard to test, hard to maintain  
**Priority**: P0  
**Category**: Architecture  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1

**Description**: 6 services and 15 routes call adminDb directly, bypassing the repository layer.

**Impact**:
- Repository layer bypassed
- Difficult to mock in tests
- Hard to change database
- Inconsistent query patterns

**Remediation**:
1. Create repository methods for all direct adminDb calls
2. Update services to use repositories
3. Update routes to use services
4. Enforce via architecture tests

**Evidence**:
- Services: AttendanceService.ts, FeesService.ts, ExamService.ts, and 3 others
- Routes: 15 routes across multiple modules

**Verification**:
- `grep -r "adminDb" services/` returns zero matches (except repositories)
- `grep -r "adminDb" app/api/v1` returns zero matches

---

### TD-05: Dead Code (8 implementations)

**Principal**: 3 days  
**Interest**: LOW — confusion, maintenance burden  
**Priority**: P1  
**Category**: Technical Debt  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1

**Description**: 8 unused implementations remain in the codebase.

**Impact**:
- Developer confusion
- Increased bundle size
- Maintenance burden

**Remediation**:
1. Delete BaseService.ts
2. Delete IOCRService.ts
3. Delete 5 dead DTOs
4. Delete 5 dead validators
5. Verify no imports reference removed code

**Evidence**:
- BaseService.ts: unused base class
- IOCRService.ts: unused OCR interface
- 5 dead DTOs: unused data transfer objects
- 5 dead validators: unused validation schemas

**Verification**:
- `grep -r "BaseService" src/` returns zero matches
- `grep -r "IOCRService" src/` returns zero matches
- `grep -r "DeadDTO" src/` returns zero matches

---

### TD-06: Duplicate Implementations (4)

**Principal**: 5 days  
**Interest**: MEDIUM — maintenance burden, inconsistent behavior  
**Priority**: P1  
**Category**: Technical Debt  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1

**Description**: 4 sets of duplicate implementations exist.

**Impact**:
- Bug fixes need to be applied in multiple places
- Inconsistent behavior
- Increased bundle size

**Remediation**:
1. Consolidate duplicate job.service.ts
2. Consolidate duplicate configuration.service.ts
3. Merge validation schemas into single source
4. Merge duplicate student validators

**Evidence**:
- job.service.ts: 2 implementations
- configuration.service.ts: 2 implementations
- validation schemas: 3 locations (validators/, lib/validation/, dto/)
- student validators: 2 implementations

**Verification**:
- Single implementation per functionality
- All imports reference canonical implementation

---

### TD-07: Split-Brain Validation

**Principal**: 5 days  
**Interest**: MEDIUM — inconsistent validation, security risk  
**Priority**: P1  
**Category**: Technical Debt  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1

**Description**: Validation logic is scattered across 3 locations: routes, services, and repositories.

**Impact**:
- Inconsistent validation
- Security gaps
- Hard to maintain
- Validation bypass possible

**Remediation**:
1. Consolidate validation into domain-level validators
2. Update services to use centralized validators
3. Remove validation from routes and repositories
4. Enforce via code review checklist

**Evidence**:
- validators/: 15+ validator files
- lib/validation/: 10+ schema files
- dto/: 5+ validator files
- Routes: inline validation in route handlers
- Services: inline validation in service methods
- Repositories: inline validation in repository methods

**Verification**:
- Validation exists in exactly one location per domain
- No inline validation in routes or repositories

---

### TD-08: Incomplete Barrel Exports

**Principal**: 2 days  
**Interest**: LOW — import inconsistency, difficult refactoring  
**Priority**: P2  
**Category**: Developer Experience  
**Owner**: Platform Team  
**Target Sprint**: Sprint 1

**Description**: Barrel exports (index.ts) are incomplete, leading to inconsistent import patterns.

**Impact**:
- Inconsistent import paths
- Difficult to refactor
- Poor developer experience

**Remediation**:
1. Complete services/index.ts
2. Complete repositories/index.ts
3. Complete types/index.ts
4. Update all imports to use barrel exports

**Evidence**:
- services/index.ts: missing 10+ services
- repositories/index.ts: missing 8+ repositories
- types/index.ts: missing 15+ types

**Verification**:
- All imports use barrel exports
- No deep imports (e.g., services/student.service.ts)

---

### TD-09: No Event Publishers

**Principal**: 10 days  
**Interest**: HIGH — events system non-functional, blocks notifications and audit  
**Priority**: P0  
**Category**: Platform  
**Owner**: Platform Team  
**Target Sprint**: Sprint 3

**Description**: Event bus exists but 0 publishers implement it for core modules.

**Impact**:
- Events system non-functional
- Notifications not triggered
- Audit not automated
- Integrations not possible

**Remediation**:
1. Add EventBus.publish() calls in StudentService
2. Add EventBus.publish() calls in StaffService
3. Add EventBus.publish() calls in AttendanceService
4. Add EventBus.publish() calls in FeesService
5. Add EventBus.publish() calls in ExamService
6. Add EventBus.publish() calls in all other services

**Evidence**:
- Event types defined in lib/events/events.ts
- 14 listeners exist but 0 publishers in services
- Event bus implemented but unused

**Verification**:
- All domain operations emit events
- Event listeners receive and process events

---

### TD-10: Workers Not Deployed

**Principal**: 5 days  
**Interest**: HIGH — jobs not processing, notifications blocked  
**Priority**: P0  
**Category**: Platform  
**Owner**: Platform Team  
**Target Sprint**: Sprint 4

**Description**: 7 workers defined but not deployed to production.

**Impact**:
- Email not sent asynchronously
- SMS not sent asynchronously
- Reports not generated in background
- AI processing blocked

**Remediation**:
1. Containerize all 7 workers
2. Deploy to production infrastructure
3. Configure horizontal scaling
4. Add health checks

**Evidence**:
- workers/: 7 worker implementations
- No deployment configuration
- No running workers in production

**Verification**:
- All 7 workers running
- Jobs processed successfully
- Monitoring dashboard shows worker status

---

### TD-11: No Integration Tests

**Principal**: 20 days  
**Interest**: HIGH — regressions undetected, deployment risk  
**Priority**: P1  
**Category**: Testing  
**Owner**: QA/DevOps  
**Target Sprint**: Sprint 9

**Description**: Zero integration tests exist despite 209 unit tests.

**Impact**:
- Regressions undetected
- Deployment risk
- Difficult to refactor
- Poor confidence in changes

**Remediation**:
1. Set up test database
2. Configure test environment
3. Write auth flow tests
4. Write tenant isolation tests
5. Write RBAC tests
6. Write API endpoint tests

**Evidence**:
- test/: only unit tests for utilities
- No test/integration/ directory
- No test database configured

**Verification**:
- Integration tests cover all critical paths
- Tests run in CI pipeline

---

### TD-12: No E2E Tests

**Principal**: 15 days  
**Interest**: MEDIUM — broken workflows undetected  
**Priority**: P1  
**Category**: Testing  
**Owner**: QA/DevOps  
**Target Sprint**: Sprint 9

**Description**: Zero E2E tests exist.

**Impact**:
- Broken workflows undetected
- Poor user experience
- Regression risk

**Remediation**:
1. Configure Playwright
2. Write login/onboarding flow
3. Write student enrollment flow
4. Write attendance marking flow
5. Write report generation flow

**Evidence**:
- No test/e2e/ directory
- No E2E framework configured

**Verification**:
- E2E tests cover 5 critical journeys
- Tests run in CI pipeline

---

### TD-13: Missing Module Interfaces (10 modules)

**Principal**: 20 days  
**Interest**: HIGH — technical debt, prevents safe refactoring  
**Priority**: P1  
**Category**: Architecture  
**Owner**: Module Teams  
**Target Sprint**: Sprint 5-6

**Description**: 10 modules lack complete interfaces, entities, DTOs, and mappers.

**Impact**:
- No type safety
- Difficult to refactor
- Inconsistent patterns
- High bug surface

**Remediation**:
1. Attendance: interface, entity, mapper
2. Parents: interface, entity, document, mapper
3. Fees: interface, entity, mapper
4. Dashboard: interface, layering
5. Analytics: interface, centralized logic
6. Academics: 8 service interfaces
7. Library: interface, entity, mapper
8. Transport: interface, entity, mapper
9. Hostel: interface, entity, mapper
10. Communication: 5 service interfaces

**Evidence**:
- Only Students and Staff at gold standard
- 10 modules missing complete stacks

**Verification**:
- All modules have complete stacks
- TypeScript strict mode passes

---

### TD-14: No AI Safety (Moderation, Fallback)

**Principal**: 10 days  
**Interest**: MEDIUM — safety risk, cost risk  
**Priority**: P1  
**Category**: AI  
**Owner**: AI Engineer  
**Target Sprint**: Sprint 8

**Description**: AI features lack content moderation and fallback providers.

**Impact**:
- Unsafe content can be generated
- Single point of failure (OpenAI)
- Cost overruns without fallback

**Remediation**:
1. Add OpenAI moderation API
2. Add Anthropic Claude fallback
3. Implement graceful degradation
4. Add cost monitoring

**Evidence**:
- No moderation in AIService.ts
- No fallback provider configured
- No content filtering

**Verification**:
- Unsafe content blocked
- Fallback triggers on API failure
- Cost alerts configured

---

### TD-15: No Notification Queue

**Principal**: 5 days  
**Interest**: MEDIUM — performance degradation, user experience  
**Priority**: P2  
**Category**: Platform  
**Owner**: Platform Team  
**Target Sprint**: Sprint 3-4

**Description**: Notifications are sent synchronously, blocking API responses.

**Impact**:
- Slow API responses
- Poor user experience
- Notification failures block operations

**Remediation**:
1. Implement notification queue
2. Move notification sending to workers
3. Add notification templates
4. Add retry logic

**Evidence**:
- NotificationService.ts sends emails synchronously
- No queue implementation
- No retry logic

**Verification**:
- Notifications sent asynchronously
- API response time improved
- Failed notifications retried

---

## 3. Debt Prioritization Matrix

| ID | Debt Item | Principal | Interest | Priority | Epic |
|----|-----------|-----------|----------|----------|------|
| TD-01 | Missing Service Interfaces | 20 days | High | P0 | Epic 1 |
| TD-02 | Missing Entity/DTO/Mapper Stacks | 25 days | High | P0 | Epic 1, 4 |
| TD-03 | Routes Bypassing Services | 15 days | High | P0 | Epic 1 |
| TD-04 | Direct adminDb Calls | 10 days | High | P0 | Epic 1 |
| TD-05 | Dead Code | 3 days | Low | P1 | Epic 1 |
| TD-06 | Duplicate Implementations | 5 days | Medium | P1 | Epic 1 |
| TD-07 | Split-Brain Validation | 5 days | Medium | P1 | Epic 1 |
| TD-08 | Incomplete Barrel Exports | 2 days | Low | P2 | Epic 1 |
| TD-09 | No Event Publishers | 10 days | High | P0 | Epic 3 |
| TD-10 | Workers Not Deployed | 5 days | High | P0 | Epic 3 |
| TD-11 | No Integration Tests | 20 days | High | P1 | Epic 7 |
| TD-12 | No E2E Tests | 15 days | Medium | P1 | Epic 7 |
| TD-13 | Missing Module Interfaces | 20 days | High | P1 | Epic 4 |
| TD-14 | No AI Safety | 10 days | Medium | P1 | Epic 6 |
| TD-15 | No Notification Queue | 5 days | Medium | P2 | Epic 3 |

---

## 4. Debt Payoff Schedule

### Sprint 1: High-Interest Debt

| Debt | Days | Cumulative |
|------|------|------------|
| TD-05: Dead Code | 3 | 3 |
| TD-06: Duplicates | 5 | 8 |
| TD-07: Split Validation | 5 | 13 |
| TD-08: Barrel Exports | 2 | 15 |
| TD-03: Routes Bypassing Services | 15 | 30 |
| TD-04: Direct adminDb Calls | 10 | 40 |
| TD-01: Service Interfaces (partial) | 10 | 50 |

### Sprint 2: Continued Architecture

| Debt | Days | Cumulative |
|------|------|------------|
| TD-01: Service Interfaces (remainder) | 10 | 60 |
| TD-02: Entity/DTO/Mapper (partial) | 10 | 70 |

### Sprint 3: Platform Debt

| Debt | Days | Cumulative |
|------|------|------------|
| TD-09: Event Publishers | 10 | 80 |
| TD-15: Notification Queue | 5 | 85 |

### Sprint 4: Platform Debt (continued)

| Debt | Days | Cumulative |
|------|------|------------|
| TD-10: Workers Deployed | 5 | 90 |
| TD-02: Entity/DTO/Mapper (remainder) | 15 | 105 |

### Sprint 5-6: Module Debt

| Debt | Days | Cumulative |
|------|------|------------|
| TD-13: Module Interfaces | 20 | 125 |
| TD-02: Entity/DTO/Mapper (final) | 0 | 125 |

### Sprint 7-8: AI Debt

| Debt | Days | Cumulative |
|------|------|------------|
| TD-14: AI Safety | 10 | 135 |

### Sprint 9: Testing Debt

| Debt | Days | Cumulative |
|------|------|------------|
| TD-11: Integration Tests | 20 | 155 |
| TD-12: E2E Tests | 15 | 170 |

### Remaining

| Debt | Days | Cumulative |
|------|------|------------|
| Buffer / Contingency | 8 | 178 |

---

## 5. Debt Monitoring

### Debt Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Architecture Health | 45/100 | 90/100 | Quarterly assessment |
| Dead Code Lines | ~2,000 | 0 | Static analysis |
| Duplicate Code Lines | ~1,500 | 0 | Static analysis |
| Test Coverage | 5% | 80% | Jest coverage |
| Interface Coverage | 20% | 100% | Custom script |
| Direct DB Access | 21 occurrences | 0 | Architecture tests |

### Debt Alerts

- Alert if dead code increases
- Alert if duplicate code detected
- Alert if test coverage decreases
- Alert if architecture tests fail in CI

---

## 6. Debt Prevention

### Preventive Measures

1. **Architecture Tests in CI**: Block PRs that violate architecture rules
2. **Code Review Checklist**: Include debt check
3. **Definition of Done**: Include debt criteria
4. **Regular Debt Sprints**: One sprint per quarter for debt reduction
5. **Automated Detection**: Static analysis tools in CI

### Debt Budget

Each sprint allocates 20% capacity to debt reduction. This prevents new debt accumulation while paying down existing debt.

---

## 7. Conclusion

The technical debt register quantifies the effort required to transform EduPilot into a maintainable, enterprise-grade platform. The 178-day principal is significant but necessary. The high interest on P0 items (architecture and platform debt) makes early payoff critical. The sprint plan allocates dedicated capacity to debt reduction, ensuring the platform does not accumulate additional debt during the transformation.
