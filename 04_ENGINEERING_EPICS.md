# EduPilot Enterprise Strategy Document 04: Engineering Epics

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Author**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Technical Leadership  
**Status**: Approved for Execution

---

## 1. Epic Framework Overview

The EduPilot transformation is organized into 8 engineering epics, each delivering a distinct business capability. Epics are sequenced based on dependency analysis and strategic priority. Each epic has a clear objective, duration, dependencies, blockers, and business value.

### Epic Summary Table

| Epic | Name | Sprints | Duration | Depends On | Blocks | Priority |
|------|------|---------|----------|------------|--------|----------|
| Epic 1 | Architecture Foundation | 1-2 | 4 weeks | Nothing | All epics | P0 |
| Epic 2 | Enterprise Security | 2-3 | 4 weeks | Epic 1 | Commercial, Global | P0 |
| Epic 3 | Platform Reliability | 3-4 | 4 weeks | Epic 1 | AI, Global | P0 |
| Epic 4 | Academic Core Platform | 4-6 | 6 weeks | Epic 1 | Features | P1 |
| Epic 5 | Commercial SaaS | 7 | 2 weeks | Epic 2 | Revenue | P1 |
| Epic 6 | AI Platform | 8 | 2 weeks | Epic 3 | Differentiation | P1 |
| Epic 7 | Quality & Compliance | 9 | 2 weeks | Epic 1, 2 | Enterprise Sales | P1 |
| Epic 8 | Production Hardening | 10 | 2 weeks | All previous | Release | P0 |

---

## 2. Epic 1: Architecture Foundation

### Objective
Establish and enforce clean architecture standards across the entire codebase.

### Duration
Sprint 1-2 (4 weeks)

### Depends on
Nothing

### Blocks
All other epics

### Business Value
Enables sustainable development velocity for the next 10 years. Without this foundation, all subsequent work accumulates more debt.

### Key Deliverables

1. **Architecture Enforcement Framework**
   - ESLint custom rules for dependency direction (routes → services → repositories → database)
   - Architecture tests (Jest) that prevent routes from importing repositories directly
   - Code review checklist with architecture gate
   - CI pipeline integration with architecture test failure on PR

2. **Module Interfaces**
   - Create interfaces for 27 services lacking them
   - Standardize method signatures across all services
   - Add constructor injection verification

3. **Application/Use-Case Layer**
   - Define boundaries between application and domain layers
   - Create use-case interfaces for cross-service orchestration
   - Document layer responsibilities

4. **Dead Code Removal**
   - Delete BaseService.ts
   - Delete IOCRService.ts
   - Delete 5 dead DTOs
   - Delete 5 dead validators
   - Verify no imports reference removed code

5. **Duplicate Removal**
   - Consolidate duplicate job.service.ts
   - Consolidate duplicate configuration.service.ts
   - Merge validation schemas into single source of truth
   - Merge duplicate student validators

6. **Dependency Direction Fixes**
   - Refactor 49 routes to call services instead of repositories
   - Refactor 6 services to use repositories instead of adminDb
   - Verify dependency graph via architecture tests

### Success Criteria

- All 34 services implement interfaces
- All 30 repositories implement interfaces
- Zero dead code remains
- Zero duplicate implementations remain
- Validation schemas exist in exactly one location per domain
- All routes go through services (except auth/public routes)
- Architecture tests pass in CI
- `npm run lint` passes with new rules

### Risk Assessment
**Risk**: LOW — mostly cleanup and refactoring  
**Mitigation**: Comprehensive tests exist, feature flags not needed

### Team Assignment
Platform Team (3 engineers)

---

## 3. Epic 2: Enterprise Security

### Objective
Harden authentication, authorization, and tenant isolation to enterprise standards.

### Duration
Sprint 2-3 (4 weeks)

### Depends on
Epic 1 (Sprint 1)

### Blocks
Commercial SaaS, Global Deployment

### Business Value
Required for enterprise sales, compliance, and customer trust. Fortune 500 customers will not sign without solid security.

### Key Deliverables

1. **Auth Middleware Hardening**
   - Cookie validation (not just existence check)
   - Server-side session validation
   - Session invalidation on logout
   - Remove ID token fallback (security risk)

2. **Session Management**
   - Refresh token implementation
   - Refresh token rotation
   - Server-side session store
   - Concurrent session limits

3. **Permission Coverage**
   - Add auth to 3 unprotected routes (curriculum/engine, education/rules, ocr/extract)
   - Add permission checks to 12 routes missing them
   - Standardize permission enforcement pattern

4. **Tenant Isolation**
   - Fix getTeacherClasses cross-tenant leak
   - Add tenant-level query verification
   - Consider tenant-level encryption

5. **Secrets Management**
   - Remove CRON_SECRET from .env.local
   - Rotate all exposed secrets
   - Implement secrets management best practices (vault/env)

6. **Additional Security Controls**
   - CSRF protection implementation
   - Password reset flow
   - Account lockout after failed attempts
   - MFA/2FA support (optional for enterprise tier)

7. **Role Escalation Fix**
   - Secure register-user endpoint
   - Validate role assignments server-side

### Success Criteria

- All 118 routes have proper auth and permission checks
- Session cookies validated server-side
- Refresh tokens implemented with rotation
- No cross-tenant data leaks
- No secrets in codebase
- CSRF protection active
- Security scan passes with zero critical/high findings
- Penetration test passed (or scheduled)

### Risk Assessment
**Risk**: MEDIUM — auth changes affect all routes  
**Mitigation**: Gradual migration, session invalidation plan, comprehensive testing

### Team Assignment
Security Team (2 engineers) + Platform Team (1 engineer)

---

## 4. Epic 3: Platform Reliability

### Objective
Make event system and background jobs production-ready.

### Duration
Sprint 3-4 (4 weeks)

### Depends on
Epic 1 (Sprint 1)

### Blocks
AI Platform, Global Deployment

### Business Value
Required for operational stability and scalability. Events power notifications, audit, integrations, and decoupling.

### Key Deliverables

1. **Event Publishers Implementation**
   - StudentService: publish StudentCreated, StudentUpdated, StudentDeleted
   - StaffService: publish StaffCreated, StaffUpdated, StaffDeleted
   - AttendanceService: publish AttendanceMarked, AttendanceCorrected
   - FeesService: publish InvoiceCreated, PaymentReceived, PaymentFailed
   - ExamService: publish ExamCreated, ResultPublished
   - All other services: define and publish domain events

2. **Event Bus Hardening**
   - Event persistence (outbox pattern)
   - Error isolation (per-listener error boundaries)
   - Schema validation (Zod) for all events
   - Dead letter queue processing
   - Event replay capability

3. **Background Jobs Deployment**
   - Deploy email worker
   - Deploy SMS worker
   - Deploy notification worker
   - Deploy report worker
   - Deploy export worker
   - Deploy AI worker
   - Deploy cleanup worker

4. **Job Operations**
   - Job monitoring dashboard
   - Retry alerts implementation
   - Dead letter queue processing for jobs
   - Job cancellation API
   - Cron job security (remove hardcoded fallback)

5. **Notification Infrastructure**
   - Notification queue (async, non-blocking)
   - Notification templates
   - Retry logic for failed notifications

### Success Criteria

- All domain events published from service layer
- Event listeners perform actual work (not stubs)
- Failed events retried automatically
- Events persist across restarts
- All 7 workers running in production
- Jobs complete successfully with <1% failure rate
- Monitoring dashboard operational
- No hardcoded secrets in codebase

### Risk Assessment
**Risk**: MEDIUM — affects many services  
**Mitigation**: Event persistence prevents data loss, staged rollout

### Team Assignment
Platform Team (2 engineers) + Backend Engineer (1 engineer)

---

## 5. Epic 4: Academic Core Platform

### Objective
Complete all 12 modules to gold standard architecture.

### Duration
Sprint 4-6 (6 weeks)

### Depends on
Epic 1 (Sprint 1)

### Blocks
Feature completeness

### Business Value
Core product functionality. Reduces technical debt and improves maintainability.

### Key Deliverables

**Sprint 5: Module Completion Part 1**

1. Attendance Module
   - IAttendanceService interface
   - Attendance entity
   - AttendancePersistenceMapper
   - AttendanceDTO, AttendanceResponseDTO
   - AttendanceValidator

2. Parents Module
   - IParentService interface
   - Parent entity
   - ParentDocument entity
   - ParentPersistenceMapper
   - ParentDTO, ParentResponseDTO
   - ParentValidator

3. Fees Module
   - IFeesService interface
   - Invoice entity
   - Payment entity
   - FeesPersistenceMapper
   - InvoiceDTO, PaymentDTO
   - FeesValidator

4. Academics Interfaces (8 services)
   - IExamService
   - IAssignmentService
   - IHomeworkService
   - IMarkService
   - ISyllabusService
   - ITimetableService
   - ISubjectService
   - IClassService

**Sprint 6: Module Completion Part 2**

5. Dashboard Module
   - IDashboardService interface
   - Proper layering (service → use case)
   - Centralized query logic

6. Analytics Module
   - IAnalyticsService interface
   - Centralized analytics logic
   - Proper aggregation patterns

7. Communication Interfaces (5 services)
   - INoticeService
   - IEventService
   - IMessageService
   - IBlogService
   - IVideoLectureService

8. Standardization
   - Parameter ordering: (tenantId, id, data, userId)
   - Remove all `as any` casts
   - Consistent error handling

### Module Health Targets

| Module | Current | Target | Sprint |
|--------|---------|--------|--------|
| Students | 9/10 | 9/10 | Maintain |
| Staff | 9/10 | 9/10 | Maintain |
| Attendance | 7/10 | 9/10 | Sprint 5 |
| Parents | 7/10 | 9/10 | Sprint 5 |
| Fees | 7/10 | 9/10 | Sprint 5 |
| Dashboard | 6/10 | 9/10 | Sprint 6 |
| Analytics | 5/10 | 9/10 | Sprint 6 |
| Academics | 6/10 | 9/10 | Sprint 5-6 |
| Library | 5/10 | 9/10 | Sprint 6 |
| Transport | 5/10 | 9/10 | Sprint 6 |
| Hostel | 5/10 | 9/10 | Sprint 6 |
| Communication | 6/10 | 9/10 | Sprint 6 |

### Success Criteria

- All 12 modules have interfaces, entities, DTOs, mappers
- All services use constructor injection
- No business logic in repositories
- All routes go through services
- No `as any` casts remain
- TypeScript strict mode passes
- Module tests pass

### Risk Assessment
**Risk**: LOW — adding structure to existing working code  
**Mitigation**: Existing tests provide safety net, incremental refactoring

### Team Assignment
Module Teams (4 engineers, 2 per sprint)

---

## 6. Epic 5: Commercial SaaS

### Objective
Complete billing, subscriptions, and invoicing functionality.

### Duration
Sprint 7 (2 weeks)

### Depends on
Epic 2 (Sprint 3)

### Blocks
Revenue generation

### Business Value
Monetization and enterprise features. Required for sustainable business model.

### Key Deliverables

1. **Upgrade/Downgrade UI**
   - Plan comparison page
   - Upgrade flow with Stripe Checkout
   - Downgrade flow with confirmation
   - Immediate effect or end-of-billing-cycle option

2. **Cancel Subscription UI**
   - Cancel flow with feedback survey
   - Grace period handling
   - Data retention policy communication

3. **Invoice Generation**
   - InvoiceService implementation
   - Invoice entity and repository
   - Automatic invoice generation on subscription events
   - PDF generation

4. **Payment History**
   - Payment history page
   - Download invoices
   - Payment method management

5. **Proration Logic**
   - Proration calculation for mid-cycle changes
   - Credit/debit handling
   - Invoice line item transparency

6. **Subscription Analytics**
   - MRR/ARR tracking
   - Churn rate calculation
   - Revenue by plan

### Success Criteria

- Users can upgrade/downgrade via UI
- Users can cancel subscriptions
- Invoices generated automatically
- Payment history available
- Proration calculated correctly
- Stripe test mode works end-to-end

### Risk Assessment
**Risk**: LOW — new features, existing functionality unaffected  
**Mitigation**: Feature flags, Stripe test mode validation

### Team Assignment
AI/Commercial Engineer (1 engineer)

---

## 7. Epic 6: AI Platform

### Objective
Production-ready AI features with safety and excellent UX.

### Duration
Sprint 8 (2 weeks)

### Depends on
Epic 3 (Sprint 4)

### Blocks
Competitive differentiation

### Business Value
Market differentiation and premium pricing. AI features justify premium tiers.

### Key Deliverables

1. **Prompt Templates & Versioning**
   - Template management system
   - Version control for prompts
   - A/B testing support
   - Template library (student reports, lesson plans, etc.)

2. **Content Moderation**
   - OpenAI moderation API integration
   - Custom moderation rules
   - Fallback responses for unsafe content
   - Audit log for moderation decisions

3. **AI Fallback**
   - Anthropic Claude as secondary provider
   - Automatic failover on API errors
   - Graceful degradation messaging

4. **Streaming Responses**
   - Server-Sent Events for chatbot
   - Real-time response rendering
   - Connection management

5. **Conversation History**
   - Persisted conversation threads
   - Context window management
   - Conversation search and export

6. **AI Caching**
   - Cache repeated requests
   - Tenant-level cache invalidation
   - Cost monitoring and alerts

### Success Criteria

- All AI features have templates
- Content moderation active
- Fallback provider available
- Streaming responses for chatbot
- Conversation history persisted
- AI costs within budget

### Risk Assessment
**Risk**: MEDIUM — core AI service changes  
**Mitigation**: Fallback provider, feature flags, cost monitoring

### Team Assignment
AI Engineer (1 engineer)

---

## 8. Epic 7: Quality & Compliance

### Objective
Achieve production-grade testing and compliance readiness.

### Duration
Sprint 9 (2 weeks)

### Depends on
Epic 1 (Sprint 1), Epic 2 (Sprint 2)

### Blocks
Enterprise sales, SOC 2, GDPR

### Business Value
Required for enterprise contracts and regulatory compliance.

### Key Deliverables

1. **Integration Tests**
   - Auth flow tests (login, logout, refresh, password reset)
   - Tenant isolation tests (cross-tenant data leak prevention)
   - RBAC permission tests (role enforcement)
   - API endpoint tests for all critical paths
   - Database transaction tests

2. **E2E Tests**
   - Login and onboarding
   - Create student and enroll in class
   - Mark attendance and generate report
   - Create invoice and process payment
   - Admin user management

3. **Expanded Audit Coverage**
   - Login/logout audit
   - Permission change audit
   - Payment audit
   - AI usage audit
   - Admin action audit

4. **Audit Features**
   - Audit export (CSV, JSON)
   - Audit search and filtering
   - Retention policy implementation
   - Audit log archival

5. **Compliance Documentation**
   - SOC 2 readiness assessment
   - GDPR compliance checklist
   - Data processing agreements
   - Security policies

### Success Criteria

- Integration tests cover all critical paths
- E2E tests cover 5 critical user journeys
- Audit coverage >80%
- Audit logs exportable and searchable
- SOC 2 readiness assessment complete
- GDPR compliance checklist complete

### Risk Assessment
**Risk**: LOW — new tests, no production changes  
**Mitigation**: Test environment isolated from production

### Team Assignment
QA/DevOps (1 engineer) + Security Engineer (1 engineer)

---

## 9. Epic 8: Production Hardening

### Objective
Prepare for production deployment with performance, monitoring, and documentation.

### Duration
Sprint 10 (2 weeks)

### Depends on
All previous epics

### Blocks
Release Candidate

### Business Value
Production readiness and operational excellence. Required for enterprise launch.

### Key Deliverables

1. **Performance Optimization**
   - N+1 query elimination
   - Database index optimization
   - Response caching strategy
   - Connection pooling

2. **Monitoring & Observability**
   - Metrics collection (Prometheus/Grafana)
   - Distributed tracing (OpenTelemetry)
   - Centralized logging
   - Alerting rules

3. **API Documentation**
   - OpenAPI/Swagger specification
   - Interactive API docs
   - SDK documentation

4. **Documentation**
   - Deployment guides
   - Operations runbooks
   - Disaster recovery plan
   - Incident response procedures

5. **Security Audit**
   - External security audit
   - Penetration testing
   - Vulnerability remediation

6. **Load Testing**
   - Load test plan
   - Stress testing
   - Failover testing

### Success Criteria

- API response time <200ms p95
- 99.9% uptime in load test
- Security audit zero critical/high findings
- Complete documentation
- Load test passes at 10x expected traffic

### Risk Assessment
**Risk**: LOW — optimization and documentation  
**Mitigation**: Performance benchmarks established early

### Team Assignment
Platform Team (2 engineers) + QA/DevOps (1 engineer) + Security Engineer (1 engineer)

---

## 10. Epic Dependencies Visual

```
Epic 1: Architecture Foundation
    ├── Epic 2: Enterprise Security
    │       └── Epic 5: Commercial SaaS
    ├── Epic 3: Platform Reliability
    │       └── Epic 6: AI Platform
    ├── Epic 4: Academic Core Platform
    ├── Epic 7: Quality & Compliance
    └── Epic 8: Production Hardening
```

---

## 11. Epic Sequencing Rationale

### Why Epic 1 First?
Architecture is the foundation for everything. Without clean architecture, security fixes, module completions, and platform improvements all accumulate more debt. This is the highest-leverage investment.

### Why Epic 2 Before Epic 5?
Commercial features (billing, subscriptions) handle sensitive payment data and require hardened auth. Enterprise customers will not adopt without security assurance.

### Why Epic 3 Before Epic 6?
AI features require background processing for streaming, moderation, and fallback. Workers must be deployed before AI platform can scale.

### Why Epic 7 Before Release?
Enterprise sales require compliance evidence. SOC 2 and GDPR readiness must be demonstrated before signing enterprise contracts.

### Why Epic 8 Last?
Production hardening builds on all previous epics. Performance optimization, monitoring, and documentation are final polish before launch.

---

## 12. Epic Acceptance Criteria

Each epic has defined acceptance criteria at the epic level:

| Epic | Acceptance Criteria |
|------|---------------------|
| Epic 1 | All services/repositories have interfaces, no dead code, architecture tests pass |
| Epic 2 | All routes have auth/permissions, no security scan findings, tenant isolation verified |
| Epic 3 | All events published, workers running, monitoring operational |
| Epic 4 | All 12 modules at gold standard, TypeScript strict mode passes |
| Epic 5 | Billing UI functional, Stripe integration complete, invoices generated |
| Epic 6 | AI features production-ready, safety review passed, streaming works |
| Epic 7 | Integration/E2E tests pass, audit coverage >80%, compliance docs complete |
| Epic 8 | Performance benchmarks met, security audit clean, documentation complete |

---

## 13. Conclusion

The 8-epic framework provides a structured, dependency-aware approach to transforming EduPilot into an enterprise-grade platform. Each epic delivers incremental value while building toward the 2027 launch goal. Strict sequencing ensures that foundations are solid before dependent work begins, minimizing rework and maximizing engineering efficiency.
