# EduPilot Enterprise Strategy Document 13: Phase 2 Implementation Plan

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Author**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Technical Leadership  
**Status**: Approved for Execution

---

## 1. Implementation Plan Overview

This document provides the immediate, actionable implementation plan for Phase 2 of the EduPilot enterprise transformation. It translates the strategic roadmap into specific tasks, owners, timelines, and verification criteria.

### Implementation Principles

1. **Incremental Delivery**: Each day delivers measurable progress
2. **Risk-First**: Address highest-risk items earliest
3. **Parallel Execution**: Independent tracks run concurrently
4. **Verification at Every Step**: Each task has clear acceptance criteria
5. **Rollback Ready**: Every change is reversible

---

## 2. Immediate Actions (Week 1)

### Day 1-2: Remove Dead Code and Duplicates

**Objective**: Reduce confusion and maintenance burden  
**Owner**: Platform Team  
**Risk**: LOW

#### Tasks

| Task | Files | Effort | Verification |
|------|-------|--------|--------------|
| Delete BaseService.ts | services/BaseService.ts | 0.5 day | grep returns 0 matches |
| Delete IOCRService.ts | services/IOCRService.ts | 0.5 day | grep returns 0 matches |
| Delete 5 dead DTOs | dto/**/*.dead.ts | 1 day | grep returns 0 matches |
| Delete 5 dead validators | validators/**/*.dead.ts | 1 day | grep returns 0 matches |
| Remove duplicate job.service.ts | services/job.service.ts (keep one) | 0.5 day | Single implementation |
| Remove duplicate configuration.service.ts | services/configuration.service.ts | 0.5 day | Single implementation |
| Merge validation schemas | validators/, lib/validation/, dto/ | 1 day | Single source of truth |
| Complete barrel exports | services/index.ts, repositories/index.ts, types/index.ts | 1 day | All imports use barrels |

#### Commands

```bash
# Verify dead code removed
grep -r "BaseService" src/ || echo "CLEAN"
grep -r "IOCRService" src/ || echo "CLEAN"

# Verify duplicates removed
find src -name "*.service.ts" | xargs grep -l "job" | wc -l  # Should be 1

# Verify barrel exports
grep -r "from.*services/" src/ | grep -v "index.ts" | wc -l  # Should be 0
```

#### Acceptance Criteria

- [ ] `npm run lint` passes
- [ ] `npm test` passes (209/209)
- [ ] No dead code remains
- [ ] No duplicate implementations remain
- [ ] Validation schemas in exactly one location per domain
- [ ] All imports use barrel exports

---

### Day 3-4: Fix Critical Security Issues

**Objective**: Address highest-risk vulnerabilities  
**Owner**: Security Team + Platform Team  
**Risk**: MEDIUM

#### Tasks

| Task | Files | Effort | Verification |
|------|-------|--------|--------------|
| Fix getTeacherClasses tenant leak | repositories/teacher.repository.ts | 1 day | Tenant isolation tests pass |
| Add auth to curriculum/engine | app/api/v1/curriculum/engine/route.ts | 0.5 day | Auth test passes |
| Add auth to education/rules | app/api/v1/education/rules/route.ts | 0.5 day | Auth test passes |
| Add auth to ocr/extract | app/api/v1/ocr/extract/route.ts | 0.5 day | Auth test passes |
| Fix role escalation in register-user | app/api/v1/auth/register-user/route.ts | 1 day | Permission test passes |
| Remove CRON_SECRET from .env.local | .env.local | 0.5 day | gitleaks scan passes |
| Rotate exposed secrets | All .env files | 1 day | No secrets in git history |

#### Commands

```bash
# Verify no secrets in code
gitleaks detect --source . --no-git || echo "CLEAN"

# Verify tenant isolation
grep -r "getTeacherClasses" src/ | wc -l  # Should be 1 (the fix)

# Verify auth on all routes
grep -L "withAuth\|withPermission" app/api/v1/**/*.ts | wc -l  # Should be 0
```

#### Acceptance Criteria

- [ ] No cross-tenant data leaks
- [ ] All routes have auth and permissions
- [ ] No hardcoded secrets in code
- [ ] Role escalation fixed
- [ ] Security scan passes

---

### Day 5: Implement Architecture Enforcement

**Objective**: Prevent future architectural deviations  
**Owner**: Platform Team  
**Risk**: LOW

#### Tasks

| Task | Files | Effort | Verification |
|------|-------|--------|--------------|
| Add ESLint dependency direction rule | .eslintrc.js | 1 day | Lint catches violations |
| Add architecture tests | test/architecture/**/*.test.ts | 1 day | Tests fail on violations |
| Update CI pipeline | .github/workflows/ci.yml | 0.5 day | CI enforces rules |
| Create code review checklist | docs/CODE_REVIEW.md | 0.5 day | Checklist published |

#### Commands

```bash
# Verify architecture tests
npm run test:architecture  # Should fail if violations exist

# Verify ESLint rules
npm run lint  # Should catch dependency violations
```

#### Acceptance Criteria

- [ ] ESLint rules catch dependency direction violations
- [ ] Architecture tests fail if routes import repositories
- [ ] CI pipeline blocks PRs with violations
- [ ] Code review checklist published

---

## 3. Week 2-4: Security & Architecture

### Week 2: Continue Architecture Work

**Owner**: Platform Team  
**Parallel with**: Security fixes

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Complete service interfaces (27 services) | 5 days | All services have interfaces |
| Complete repository interfaces (16 repos) | 3 days | All repos have interfaces |
| Fix 49 routes calling repositories directly | 5 days | Architecture tests pass |
| Fix 6 services calling adminDb directly | 2 days | No adminDb in services |

### Week 3-4: Complete Security Foundation

**Owner**: Security Team  
**Depends on**: Week 1 security fixes

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Harden auth middleware (cookie validation) | 3 days | Auth tests pass |
| Implement refresh tokens | 2 days | Refresh flow works |
| Add permission checks to 12 routes | 3 days | Permission tests pass |
| Add CSRF protection | 2 days | CSRF tests pass |
| Add password reset flow | 3 days | Password reset works |
| Add account lockout | 2 days | Lockout triggers correctly |
| Add MFA/2FA support | 3 days | MFA flow works |

---

## 4. Week 5-8: Platform Integration

### Week 5-6: Event System (Sprint 3)

**Owner**: Platform Team  
**Depends on**: Architecture baseline (Week 2)

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Implement event publishers (StudentService) | 1 day | Events published |
| Implement event publishers (StaffService) | 1 day | Events published |
| Implement event publishers (AttendanceService) | 1 day | Events published |
| Implement event publishers (FeesService) | 1 day | Events published |
| Implement event publishers (ExamService) | 1 day | Events published |
| Implement event publishers (other services) | 3 days | Events published |
| Harden event bus (persistence) | 2 days | Events persist |
| Harden event bus (error isolation) | 2 days | Errors isolated |
| Implement DLQ processing | 2 days | DLQ empty |
| Implement retry logic | 2 days | Retries work |

### Week 7-8: Background Jobs (Sprint 4)

**Owner**: Platform Team  
**Depends on**: Event system (Week 6)

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Deploy email worker | 1 day | Worker running |
| Deploy SMS worker | 1 day | Worker running |
| Deploy notification worker | 1 day | Worker running |
| Deploy report worker | 1 day | Worker running |
| Deploy export worker | 1 day | Worker running |
| Deploy AI worker | 1 day | Worker running |
| Deploy cleanup worker | 1 day | Worker running |
| Job monitoring dashboard | 2 days | Dashboard operational |
| Retry alerts implementation | 1 day | Alerts configured |
| Secure cron jobs | 2 days | No hardcoded secrets |

---

## 5. Week 9-12: Module Completion

### Week 9-10: Module Completion Part 1 (Sprint 5)

**Owner**: Module Teams  
**Depends on**: Architecture baseline

#### Tasks

| Module | Effort | Verification |
|--------|--------|--------------|
| Attendance (interface, entity, mapper) | 5 days | Module at gold standard |
| Parents (interface, entity, document, mapper) | 5 days | Module at gold standard |
| Fees (interface, entity, mapper) | 5 days | Module at gold standard |
| Academics interfaces (8 services) | 5 days | All services have interfaces |

### Week 11-12: Module Completion Part 2 (Sprint 6)

**Owner**: Module Teams  
**Depends on**: Sprint 5

#### Tasks

| Module | Effort | Verification |
|--------|--------|--------------|
| Dashboard (interface, layering) | 5 days | Module at gold standard |
| Analytics (interface, centralized logic) | 5 days | Module at gold standard |
| Communication interfaces (5 services) | 5 days | All services have interfaces |
| Standardize parameter ordering | 2 days | Consistent ordering |
| Remove all `as any` casts | 3 days | Zero `as any` casts |

---

## 6. Week 13-16: Commercial & AI

### Week 13-14: Commercial SaaS (Sprint 7)

**Owner**: AI/Commercial Engineer  
**Depends on**: Security foundation (Week 4)

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Upgrade/downgrade UI | 5 days | UI functional in staging |
| Cancel subscription UI | 2 days | UI functional in staging |
| Invoice generation service | 3 days | Invoices generated |
| Payment history tracking | 2 days | History available |
| Proration logic | 2 days | Proration correct |
| Subscription analytics | 2 days | Analytics displayed |

### Week 15-16: AI Platform (Sprint 8)

**Owner**: AI Engineer  
**Depends on**: Workers deployed (Week 8)

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Prompt templates and versioning | 4 days | Templates managed |
| Content moderation layer | 3 days | Moderation active |
| AI fallback provider | 2 days | Fallback works |
| Streaming responses | 3 days | Streaming functional |
| Conversation history | 2 days | History persisted |
| AI caching | 2 days | Caching works |

---

## 7. Week 17-20: Quality & Launch

### Week 17-18: Testing & Compliance (Sprint 9)

**Owner**: QA/DevOps + Security Engineer  
**Depends on**: All features complete

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Integration tests (auth, tenant, RBAC) | 8 days | Tests pass |
| E2E tests (critical journeys) | 5 days | Tests pass |
| Audit coverage expansion | 5 days | Coverage >80% |
| Audit export/search/retention | 3 days | Features functional |
| Compliance documentation | 2 days | Docs complete |

### Week 19-20: Production Hardening (Sprint 10)

**Owner**: Full team  
**Depends on**: Sprint 9

#### Tasks

| Task | Effort | Verification |
|------|--------|--------------|
| Performance optimization (N+1, caching) | 5 days | Benchmarks met |
| Monitoring and observability | 4 days | Dashboard operational |
| API documentation (OpenAPI) | 3 days | Docs complete |
| Deployment guides | 2 days | Guides published |
| Security audit | 3 days | Audit passed |
| Load testing | 3 days | Load test passed |

---

## 8. Daily Execution Plan

### Daily Standup Structure

1. **Yesterday**: What was completed
2. **Today**: What will be worked on
3. **Blockers**: What is blocking progress
4. **Help Needed**: What assistance is required

### Daily Workflow

| Time | Activity |
|------|----------|
| 9:00 AM | Daily standup |
| 9:15 AM | Focused coding |
| 12:00 PM | Lunch |
| 1:00 PM | Focused coding |
| 3:00 PM | Code review / collaboration |
| 5:00 PM | End of day, update task board |

### Weekly Checkpoints

| Day | Activity |
|-----|----------|
| Monday | Sprint planning (Week 1) or task review |
| Wednesday | Mid-sprint check |
| Friday | Sprint demo + retrospective |

---

## 9. Success Criteria

### Phase 2 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dead Code Remaining | 0 | Static analysis |
| Duplicate Code Remaining | 0 | Static analysis |
| Critical Security Vulnerabilities | 0 | Security scan |
| Event Publishers Implemented | 100% | Code search |
| Workers Deployed | 7 | Monitoring dashboard |
| Modules at Gold Standard | 12 | Architecture tests |
| Test Coverage (new code) | >80% | Jest coverage |
| Integration Tests | All critical paths | Test report |
| E2E Tests | 5+ journeys | Test report |

### Go/No-Go Criteria

At the end of each sprint, the following criteria determine whether to proceed:

| Sprint | Go Criteria |
|--------|-------------|
| Sprint 1 | Architecture tests pass, dead code removed |
| Sprint 2 | Security scan passes, all routes have auth |
| Sprint 3 | Events published, event bus operational |
| Sprint 4 | Workers running, monitoring operational |
| Sprint 5 | 5 modules at gold standard |
| Sprint 6 | All 12 modules at gold standard |
| Sprint 7 | Billing UI functional, Stripe working |
| Sprint 8 | AI features production-ready |
| Sprint 9 | Integration/E2E tests pass, audit complete |
| Sprint 10 | Performance benchmarks met, security audit clean |

---

## 10. Contingency Planning

### If Behind Schedule

| Delay | Action |
|-------|--------|
| 1 week | Reduce scope (defer non-critical features) |
| 2 weeks | Add contractor resources |
| 3+ weeks | Re-prioritize, consider phased release |

### If Technical Blockers

| Blocker | Resolution |
|---------|-----------|
| Architecture refactor breaks features | Revert, re-apply incrementally |
| Event system data loss | Disable events, fix offline |
| Worker deployment fails | Continue synchronous, defer workers |
| Security changes break sessions | Extend old format support |
| Module refactor regressions | Revert module, fix incrementally |

---

## 11. Communication Plan

### Daily Communication

| Communication | Channel | Audience |
|---------------|---------|----------|
| Standup | Video call | Full team |
| Blockers | Slack | Team + leads |
| Progress | Slack | Team |

### Weekly Communication

| Communication | Channel | Audience |
|---------------|---------|----------|
| Sprint demo | Video call | Team + stakeholders |
| Sprint metrics | Email | Leadership |
| Risk updates | Slack | Leads |

### Escalation

| Issue | Escalation Path |
|-------|-----------------|
| Blocker >1 day | Engineering Manager |
| Blocker >3 days | CTO |
| Security incident | CTO + CEO |

---

## 12. Conclusion

This implementation plan provides day-by-day, week-by-week guidance for executing the EduPilot enterprise transformation. The plan balances urgency with sustainability, addressing the highest-risk items first while maintaining momentum across all tracks. Success requires disciplined execution, proactive communication, and rigorous adherence to verification criteria.
