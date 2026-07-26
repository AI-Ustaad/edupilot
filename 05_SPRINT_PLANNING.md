# EduPilot Enterprise Strategy Document 05: Sprint Planning

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Author**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Technical Leadership  
**Status**: Approved for Execution

---

## 1. Sprint Framework

EduPilot follows a 2-week sprint cadence with fixed start (Monday Week 1) and end (Friday Week 2) dates. Each sprint delivers a potentially shippable increment. Sprint ceremonies include planning, daily standups, demo, and retrospective.

### Sprint Cadence

| Ceremony | Day | Time | Duration | Participants |
|----------|-----|------|----------|--------------|
| Sprint Planning | Monday Week 1 | 10:00 AM | 2 hours | Full team |
| Daily Standup | Daily | 9:00 AM | 15 min | Full team |
| Sprint Demo | Friday Week 2 | 2:00 PM | 1 hour | Full team + stakeholders |
| Retrospective | Friday Week 2 | 3:30 PM | 1 hour | Full team |
| Sprint Review | Friday Week 2 | 5:00 PM | 30 min | Engineering leads |

---

## 2. Sprint 1: Architecture Stabilization (Weeks 1-2)

### Objective
Establish clean architecture enforcement and reduce technical debt.

### Why This Sprint
Without a solid foundation, all subsequent work accumulates more debt. This sprint creates the guardrails that prevent future deviations.

### Team Assignment
Platform Team (3 engineers)

### Deliverables

1. **Architecture Enforcement Framework** (5 days)
   - ESLint custom rules for dependency direction
   - Architecture tests (Jest) verifying routes only import services
   - CI pipeline integration
   - Code review checklist

2. **Dead Code Removal** (2 days)
   - Delete BaseService.ts
   - Delete IOCRService.ts
   - Delete 5 dead DTOs
   - Delete 5 dead validators
   - Verify no imports reference removed code

3. **Duplicate Removal** (2 days)
   - Consolidate duplicate job.service.ts
   - Consolidate duplicate configuration.service.ts
   - Merge validation schemas into single source
   - Merge duplicate student validators

4. **Validation Consolidation** (2 days)
   - Identify validation in routes, services, repositories
   - Consolidate into domain-level validators
   - Update all imports

5. **Barrel Export Completion** (2 days)
   - Complete services/index.ts
   - Complete repositories/index.ts
   - Complete types/index.ts
   - Verify all imports use barrel exports

6. **Dependency Direction Fixes** (5 days)
   - Refactor 49 routes to call services
   - Refactor 6 services to use repositories
   - Verify with architecture tests

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Services | services/*.ts | 30+ |
| Repositories | repositories/*.ts | 30+ |
| Routes | app/api/v1/**/*.ts | 49+ |
| Validators | validators/**/*.ts, lib/validation/**/*.ts | 20+ |
| Types | types/index.ts, dto/**/*.ts | 15+ |
| Config | .eslintrc.js, jest.config.js | 2 |

### Verification Criteria

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes with new rules
- [ ] `npm test` passes (209/209)
- [ ] Architecture tests pass (new)
- [ ] No direct adminDb calls outside repositories
- [ ] All services implement interfaces
- [ ] All repositories implement interfaces

### Acceptance Criteria

- All services either implement interfaces or have interfaces created
- All repositories either implement interfaces or have interfaces created
- No dead code remains
- No duplicate implementations remain
- Validation schemas exist in exactly one location per domain
- All routes go through services (except auth/public routes)

### Rollback Plan
**Risk**: LOW  
**Plan**: If issues arise, revert to git baseline. Architecture tests prevent regression.

---

## 3. Sprint 2: Security Foundation (Weeks 3-4)

### Objective
Harden authentication, authorization, and tenant isolation.

### Why This Sprint
Enterprise customers will not sign without solid security. This sprint addresses the highest-risk vulnerabilities.

### Team Assignment
Security Team (2 engineers) + Platform Team (1 engineer)

### Deliverables

1. **Auth Middleware Hardening** (5 days)
   - Cookie validation (not just existence)
   - Server-side session validation
   - Session invalidation on logout
   - Remove ID token fallback

2. **Refresh Tokens** (3 days)
   - Refresh token generation
   - Refresh token rotation
   - Server-side session store
   - Concurrent session limits

3. **Permission Coverage** (3 days)
   - Add auth to curriculum/engine route
   - Add auth to education/rules route
   - Add auth to ocr/extract route
   - Add permission checks to 12 routes

4. **Tenant Isolation Fix** (2 days)
   - Fix getTeacherClasses cross-tenant leak
   - Add tenant-level query verification
   - Add tenant isolation tests

5. **Secrets Management** (2 days)
   - Remove CRON_SECRET from .env.local
   - Rotate exposed secrets
   - Add secrets management documentation

6. **Role Escalation Fix** (1 day)
   - Secure register-user endpoint
   - Validate role assignments server-side

7. **CSRF Protection** (2 days)
   - CSRF token generation
   - CSRF middleware
   - Frontend token inclusion

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Auth | middleware.ts, lib/auth/*.ts | 5 |
| Routes | app/api/v1/**/*.ts | 15+ |
| Repositories | repositories/*.ts | 5 |
| Config | .env.example | 1 |

### Verification Criteria

- [ ] Security scan passes
- [ ] Permission tests pass
- [ ] Tenant isolation tests pass
- [ ] No hardcoded secrets in code
- [ ] All 118 routes have auth and permissions

### Acceptance Criteria

- All routes have proper auth and permission checks
- Session cookies validated server-side
- Refresh tokens implemented with rotation
- No cross-tenant data leaks
- No secrets in codebase
- CSRF protection active

### Rollback Plan
**Risk**: MEDIUM — auth changes affect all routes  
**Plan**: Gradual migration with feature flags. Maintain session invalidation plan.

---

## 4. Sprint 3: Event System (Weeks 5-6)

### Objective
Make event-driven architecture functional.

### Why This Sprint
Events power notifications, audit, integrations, and decoupling. Without events, the platform cannot scale.

### Team Assignment
Platform Team (2 engineers) + Backend Engineer (1 engineer)

### Deliverables

1. **Event Publishers** (5 days)
   - StudentService event publishers
   - StaffService event publishers
   - AttendanceService event publishers
   - FeesService event publishers
   - ExamService event publishers
   - All other service event publishers

2. **Event Bus Hardening** (5 days)
   - Event persistence (outbox pattern)
   - Error isolation (per-listener boundaries)
   - Schema validation (Zod)
   - Dead letter queue processing
   - Event replay capability

3. **Event Listener Implementation** (5 days)
   - Implement 9 non-stub listeners
   - Add error handling
   - Add logging

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Services | services/*.ts | 10+ |
| Event Bus | lib/events/*.ts | 5 |
| Listeners | listeners/*.listener.ts | 14 |
| Repositories | repositories/event-outbox.repository.ts | 1 (new) |

### Verification Criteria

- [ ] Event tests pass
- [ ] Integration tests verify event flow
- [ ] No events lost on restart
- [ ] DLQ processed within 24 hours

### Acceptance Criteria

- All domain events published from service layer
- Event listeners perform actual work
- Failed events retried automatically
- Events persist across restarts

### Rollback Plan
**Risk**: MEDIUM — affects many services  
**Plan**: Event persistence prevents data loss. Can disable events if issues arise.

---

## 5. Sprint 4: Background Jobs (Weeks 7-8)

### Objective
Deploy and operationalize background processing.

### Why This Sprint
Critical for email, SMS, reports, cleanup, and AI processing.

### Team Assignment
Platform Team (2 engineers) + Backend Engineer (1 engineer)

### Deliverables

1. **Worker Deployment** (5 days)
   - Email worker
   - SMS worker
   - Notification worker
   - Report worker
   - Export worker
   - AI worker
   - Cleanup worker

2. **Job Monitoring** (3 days)
   - Dashboard for job status
   - Alerting on failure rate >5%
   - Retry alerting

3. **Cron Security** (2 days)
   - Remove hardcoded CRON_SECRET
   - Add cron audit logging
   - Secure all 9 cron jobs

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Workers | workers/*.worker.ts | 7 |
| Cron | app/api/v1/cron/*/route.ts | 9 |
| Queues | lib/queue/queues.ts | 1 |
| Monitoring | app/api/v1/jobs/route.ts | 1 (new) |

### Verification Criteria

- [ ] Workers process jobs successfully
- [ ] Failed jobs retried
- [ ] Monitoring dashboard operational
- [ ] Cron jobs secure

### Acceptance Criteria

- All 7 workers running in production
- Jobs complete successfully
- Failed jobs retried with backoff
- Operations team can monitor jobs

### Rollback Plan
**Risk**: LOW — new deployment  
**Plan**: Workers can be stopped without affecting core API.

---

## 6. Sprint 5: Module Completion Part 1 (Weeks 9-10)

### Objective
Bring 5 modules to gold standard.

### Why This Sprint
Reduce technical debt, improve maintainability.

### Team Assignment
Module Teams (4 engineers, 2 per module)

### Deliverables

1. **Attendance Module** (5 days)
   - IAttendanceService interface
   - Attendance entity
   - AttendancePersistenceMapper
   - DTOs and validators

2. **Parents Module** (5 days)
   - IParentService interface
   - Parent entity
   - ParentDocument entity
   - ParentPersistenceMapper
   - DTOs and validators

3. **Fees Module** (5 days)
   - IFeesService interface
   - Invoice entity
   - Payment entity
   - FeesPersistenceMapper
   - DTOs and validators

4. **Academics Interfaces** (5 days)
   - IExamService, IAssignmentService, IHomeworkService
   - IMarkService, ISyllabusService, ITimetableService
   - ISubjectService, IClassService

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Interfaces | interfaces/*.ts | 11 (new) |
| Entities | entities/*.ts | 6 (new) |
| Mappers | lib/mappers/*.ts | 3 (new) |
| Services | services/*.ts | 8 |
| DTOs | dto/**/*.ts | 15+ |

### Verification Criteria

- [ ] Module tests pass
- [ ] TypeScript compiles
- [ ] No direct database calls from services

### Acceptance Criteria

- Modules have interfaces, entities, DTOs, mappers
- Services use constructor injection
- No business logic in repositories

### Rollback Plan
**Risk**: LOW — adding structure to existing code  
**Plan**: Incremental refactoring with existing tests as safety net.

---

## 7. Sprint 6: Module Completion Part 2 (Weeks 11-12)

### Objective
Complete remaining modules to gold standard.

### Why This Sprint
Finish architecture standardization.

### Team Assignment
Module Teams (4 engineers)

### Deliverables

1. **Dashboard Module** (5 days)
   - IDashboardService interface
   - Proper layering
   - Centralized query logic

2. **Analytics Module** (5 days)
   - IAnalyticsService interface
   - Centralized analytics logic
   - Proper aggregation patterns

3. **Communication Interfaces** (5 days)
   - INoticeService, IEventService, IMessageService
   - IBlogService, IVideoLectureService

4. **Standardization** (5 days)
   - Parameter ordering: (tenantId, id, data, userId)
   - Remove all `as any` casts
   - Consistent error handling

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Interfaces | interfaces/*.ts | 6 (new) |
| Services | services/*.ts | 7 |
| All modules | Various | 20+ |

### Verification Criteria

- [ ] Module tests pass
- [ ] TypeScript strict mode passes
- [ ] No `as any` casts remain

### Acceptance Criteria

- All 12 modules at gold standard
- Consistent parameter ordering
- Type-safe throughout

---

## 8. Sprint 7: Commercial SaaS (Weeks 13-14)

### Objective
Complete billing and subscription management.

### Why This Sprint
Revenue generation and enterprise features.

### Team Assignment
AI/Commercial Engineer (1 engineer)

### Deliverables

1. Billing UI (upgrade/downgrade/cancel) — 5 days
2. Invoice generation — 3 days
3. Payment history — 2 days
4. Proration logic — 2 days
5. Subscription analytics — 2 days

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| UI | app/(protected)/billing/**/*.tsx | 5 (new) |
| Services | services/InvoiceService.ts | 1 (new) |
| Repositories | repositories/invoice.repository.ts | 1 (new) |
| API | app/api/v1/stripe/**/*.ts | 5 |

### Verification Criteria

- [ ] Stripe test mode works end-to-end
- [ ] Invoices generated correctly
- [ ] Proration calculated correctly

---

## 9. Sprint 8: AI Platform (Weeks 15-16)

### Objective
Production-ready AI features.

### Why This Sprint
Competitive differentiation and premium pricing.

### Team Assignment
AI Engineer (1 engineer)

### Deliverables

1. Prompt templates and versioning — 4 days
2. Content moderation — 3 days
3. AI fallback — 2 days
4. Streaming responses — 3 days
5. Conversation history — 2 days
6. AI caching — 2 days

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| AI Service | services/AIService.ts | 1 (major refactor) |
| Prompts | lib/ai/prompts/**/*.ts | 5 (new) |
| Moderation | lib/ai/moderation.ts | 1 (new) |
| Streaming | lib/ai/streaming.ts | 1 (new) |
| Client | lib/openai/client.ts | 1 |

### Verification Criteria

- [ ] AI tests pass
- [ ] Streaming works correctly
- [ ] Fallback triggers on API failure
- [ ] Content moderation blocks unsafe content

---

## 10. Sprint 9: Testing & Compliance (Weeks 17-18)

### Objective
Achieve production-grade testing and compliance.

### Why This Sprint
Required for enterprise contracts and SOC 2/GDPR.

### Team Assignment
QA/DevOps (1 engineer) + Security Engineer (1 engineer)

### Deliverables

1. Integration tests — 8 days
2. E2E tests — 5 days
3. Audit expansion — 5 days
4. Compliance documentation — 2 days

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Integration Tests | test/integration/**/*.test.ts | 10 (new) |
| E2E Tests | test/e2e/**/*.test.ts | 5 (new) |
| Audit | services/AuditService.ts | 1 |
| Compliance | docs/compliance/**/*.md | 3 (new) |

### Verification Criteria

- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Audit coverage >80%
- [ ] Compliance checklist complete

---

## 11. Sprint 10: Production Hardening (Weeks 19-20)

### Objective
Prepare for production deployment.

### Why This Sprint
Final polish before enterprise launch.

### Team Assignment
Platform Team (2 engineers) + QA/DevOps (1 engineer) + Security Engineer (1 engineer)

### Deliverables

1. Performance optimization — 5 days
2. Monitoring setup — 4 days
3. API documentation — 3 days
4. Deployment guides — 2 days
5. Security audit — 3 days
6. Load testing — 3 days

### Files Expected to Change

| Category | Files | Count |
|----------|-------|-------|
| Monitoring | lib/monitoring/**/*.ts | 5 (new) |
| Docs | docs/**/*.md | 8 (new) |
| OpenAPI | openapi.yaml | 1 (new) |

### Verification Criteria

- [ ] Performance benchmarks met
- [ ] Load test passes
- [ ] Security audit clean
- [ ] Documentation complete

---

## 12. Sprint Capacity Planning

### Capacity per Sprint (10 engineers)

| Role | Count | Capacity (story points) |
|------|-------|------------------------|
| Platform Lead | 1 | 20 |
| Security Engineer | 1 | 20 |
| Backend Engineer | 1 | 20 |
| Backend Engineer 2 | 1 | 20 |
| Backend Engineer 3 | 1 | 20 |
| Backend Engineer 4 | 1 | 20 |
| AI Engineer | 1 | 20 |
| QA/DevOps | 1 | 20 |
| Backend Engineer 5 | 1 | 20 |
| Backend Engineer 6 | 1 | 20 |
| **Total** | **10** | **200** |

### Story Point Estimation by Epic

| Epic | Story Points | Sprints | Average per Sprint |
|------|-------------|---------|-------------------|
| Epic 1 | 80 | 2 | 40 |
| Epic 2 | 60 | 2 | 30 |
| Epic 3 | 60 | 2 | 30 |
| Epic 4 | 80 | 3 | 27 |
| Epic 5 | 30 | 1 | 30 |
| Epic 6 | 30 | 1 | 30 |
| Epic 7 | 40 | 1 | 40 |
| Epic 8 | 40 | 1 | 40 |
| **Total** | **420** | **13** | **32** |

*Note: Sprints 1-2 overlap (Sprint 2 starts while Sprint 1 is in final week for some tracks). Actual velocity may vary.*

---

## 13. Sprint Zero Checklist

Before Sprint 1 begins:

- [ ] Development environments configured
- [ ] CI/CD pipeline operational
- [ ] Test environment (Firebase test project) created
- [ ] Staging environment deployed
- [ ] Project management tool configured (Jira/Linear)
- [ ] Communication channels established (Slack)
- [ ] Documentation repository created
- [ ] Security baseline established
- [ ] Architecture review scheduled

---

## 14. Conclusion

The 10-sprint plan provides a detailed, week-by-week execution roadmap. Each sprint has clear deliverables, verification criteria, and rollback plans. The parallel track structure maximizes engineering productivity while maintaining necessary sequencing for dependencies.

Success requires disciplined execution, proactive risk management, and strict adherence to acceptance criteria.
