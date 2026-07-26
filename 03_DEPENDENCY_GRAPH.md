# EduPilot Enterprise Strategy Document 03: Dependency Graph

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Author**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Technical Leadership  
**Status**: Approved for Execution

---

## 1. Dependency Graph Overview

This document defines the task dependencies, critical path, parallel tracks, and blocking relationships for the EduPilot Enterprise transformation. Understanding these dependencies is essential for resource allocation, sprint planning, and risk management.

### 1.1 Dependency Types

| Type | Symbol | Description |
|------|--------|-------------|
| Finish-to-Start | FS | Task B cannot start until Task A finishes |
| Start-to-Start | SS | Task B cannot start until Task A starts |
| Finish-to-Finish | FF | Task B cannot finish until Task A finishes |
| Parallel | = | Tasks can execute simultaneously |
| Blocking | → | Task A blocks Task B |

---

## 2. Critical Path

The critical path determines the minimum timeline for project completion. Delays in critical path tasks directly delay the overall project.

### Critical Path Sequence

```
1. Architecture Enforcement (Sprint 1)
   ↓
2. Remove Dead Code & Duplicates (Sprint 1)
   ↓
3. Harden Auth Middleware (Sprint 2)
   ↓
4. Complete Permission Coverage (Sprint 2)
   ↓
5. Fix Tenant Isolation (Sprint 2)
   ↓
6. Implement Event Publishers (Sprint 3)
   ↓
7. Deploy Workers (Sprint 4)
   ↓
8. Expand Audit Coverage (Sprint 5)
   ↓
9. Implement Integration Tests (Sprint 9)
   ↓
10. Complete Module Interfaces (Sprints 5-6)
    ↓
11. Commercial SaaS (Sprint 7)
    ↓
12. AI Platform (Sprint 8)
    ↓
13. Production Hardening (Sprint 10)
    ↓
14. Release Candidate (End Sprint 10)
```

### Critical Path Duration

| Task | Duration | Cumulative |
|------|----------|------------|
| Architecture Enforcement | 10 days | 10 days |
| Remove Dead Code | 3 days | 13 days |
| Harden Auth Middleware | 10 days | 23 days |
| Complete Permission Coverage | 5 days | 28 days |
| Fix Tenant Isolation | 3 days | 31 days |
| Implement Event Publishers | 10 days | 41 days |
| Deploy Workers | 10 days | 51 days |
| Expand Audit Coverage | 10 days | 61 days |
| Integration Tests | 10 days | 71 days |
| Complete Module Interfaces | 20 days | 91 days |
| Commercial SaaS | 10 days | 101 days |
| AI Platform | 10 days | 111 days |
| Production Hardening | 10 days | 121 days |

**Critical Path Total**: ~121 days (~24 weeks with 50% engineer availability for critical path tasks)

---

## 3. Parallel Tracks

Multiple tracks can execute concurrently after Sprint 1 (Architecture Foundation). Each track has its own internal dependencies.

### Track A: Architecture Foundation

**Sprints**: 1-2  
**Engineers**: 3  
**Depends on**: Nothing  
**Blocks**: All other tracks

```
Sprint 1:
  - Architecture Enforcement (lint, tests, review)
  - Remove Dead Code
  - Remove Duplicates
  - Consolidate Validation Schemas
  - Complete Barrel Exports
  - Fix Dependency Direction

Sprint 2:
  - Complete Module Interfaces (10 modules)
  - Remove as any casts
  - Standardize parameter ordering
```

**Deliverable**: Clean, enforceable architecture baseline

### Track B: Security Hardening

**Sprints**: 2-3  
**Engineers**: 2  
**Depends on**: Track A (Sprint 1)  
**Blocks**: Track F (Commercial)

```
Sprint 2:
  - Harden Auth Middleware (cookie validation, session invalidation)
  - Add Refresh Tokens
  - Fix 3 No-Auth Routes
  - Fix Role Escalation

Sprint 3:
  - Complete Permission Coverage (12 routes)
  - Add CSRF Protection
  - Add Password Reset
  - Add Account Lockout
  - Add MFA/2FA
```

**Deliverable**: Security-hardened platform

### Track C: Platform Reliability

**Sprints**: 3-4  
**Engineers**: 2  
**Depends on**: Track A (Sprint 1)  
**Blocks**: Track G (AI)

```
Sprint 3:
  - Implement Event Publishers (all services)
  - Harden Event Bus (persistence, error isolation, schema validation)
  - Process Dead Letter Queue
  - Implement Retry Logic

Sprint 4:
  - Deploy All 7 Workers
  - Job Monitoring Dashboard
  - Retry Alerts
  - Secure Cron Jobs
  - Job Cancellation API
```

**Deliverable**: Production-ready event and job systems

### Track D: Testing & Quality

**Sprints**: 9-10  
**Engineers**: 1 (QA/DevOps)  
**Depends on**: Track A (Sprint 1)  
**Blocks**: Release Candidate

```
Sprint 9:
  - Integration Tests (auth, tenant, RBAC, API)
  - E2E Tests (critical journeys)
  - Test Framework Standardization

Sprint 10:
  - Performance Testing
  - Load Testing
  - Security Scanning Automation
```

**Deliverable**: 80%+ test coverage, compliance-ready

### Track E: Module Completion

**Sprints**: 5-6  
**Engineers**: 4 (2 per sprint)  
**Depends on**: Track A (Sprint 1)

```
Sprint 5:
  - Attendance Module (interface, entity, mapper)
  - Parents Module (interface, entity, document, mapper)
  - Fees Module (interface, entity, mapper)
  - Academics Interfaces (8 services)

Sprint 6:
  - Dashboard Module (interface, layering)
  - Analytics Module (interface, centralized logic)
  - Communication Interfaces (5 services)
  - Parameter Ordering Standardization
```

**Deliverable**: All 12 modules at gold standard

### Track F: Commercial Readiness

**Sprints**: 7  
**Engineers**: 1  
**Depends on**: Track B (Sprint 3)  
**Blocks**: Revenue Generation

```
Sprint 7:
  - Upgrade/Downgrade UI
  - Cancel Subscription UI
  - Invoice Generation Service
  - Payment History Tracking
  - Proration Logic
  - Subscription Analytics
```

**Deliverable**: Complete commercial platform

### Track G: AI Platform

**Sprints**: 8  
**Engineers**: 1  
**Depends on**: Track C (Sprint 4)

```
Sprint 8:
  - Prompt Templates and Versioning
  - Content Moderation Layer
  - AI Fallback Provider (Anthropic)
  - Streaming Responses
  - Conversation History Persistence
  - AI Caching
```

**Deliverable**: Production-ready AI features

### Track H: Developer Experience

**Sprints**: 1-2  
**Engineers**: 1 (included in Platform Team)  
**Depends on**: Track A (Sprint 1)

```
Sprint 1-2:
  - Complete Barrel Exports
  - Consolidate Validation Schemas
  - API Documentation (OpenAPI/Swagger)
  - Deployment Guides
  - Contributing Guidelines
```

**Deliverable**: Improved developer productivity

---

## 4. Blocking Relationships

### 4.1 Mandatory Sequence

These relationships cannot be parallelized:

```
Track A (Sprint 1) → Track B (Sprint 2)
Track A (Sprint 1) → Track C (Sprint 3)
Track A (Sprint 1) → Track E (Sprint 5)
Track B (Sprint 3) → Track F (Sprint 7)
Track C (Sprint 4) → Track G (Sprint 8)
```

### 4.2 Dependency Matrix

| Blocking Task | Blocked Task | Reason |
|--------------|--------------|--------|
| Track A (Sprint 1) | Track B | Security changes require stable architecture |
| Track A (Sprint 1) | Track C | Event publishers need service interfaces |
| Track A (Sprint 1) | Track E | Module completion requires interfaces |
| Track A (Sprint 1) | Track H | DX improvements need architecture baseline |
| Track B (Sprint 3) | Track F | Billing requires hardened auth |
| Track C (Sprint 4) | Track G | AI features need workers |
| Track A (Sprint 1) | Track D | Testing needs stable interfaces |
| Track E (Sprint 6) | Release | All modules must be complete |
| Track B (Sprint 3) | Release | Security must be validated |
| Track C (Sprint 4) | Release | Platform must be stable |
| Track D (Sprint 10) | Release | Quality must be assured |

---

## 5. Sprint Dependency Map

### Sprint 1: Architecture Stabilization
- **Depends on**: Nothing
- **Blocks**: All other sprints
- **Parallel Tasks**:
  - Architecture Enforcement
  - Dead Code Removal
  - Duplicate Removal
  - Validation Consolidation
  - Barrel Exports
  - Dependency Direction Fixes

### Sprint 2: Security Foundation + Module Interfaces
- **Depends on**: Sprint 1
- **Blocks**: Sprint 3, Sprint 7
- **Parallel Tasks**:
  - Auth Middleware Hardening (Track B)
  - Module Interface Creation (Track E)

### Sprint 3: Event System + Permission Coverage
- **Depends on**: Sprint 2
- **Blocks**: Sprint 4, Sprint 8
- **Parallel Tasks**:
  - Event Publishers + Event Bus Hardening (Track C)
  - Permission Coverage Completion (Track B)

### Sprint 4: Background Jobs
- **Depends on**: Sprint 3
- **Blocks**: Sprint 8
- **Parallel Tasks**:
  - Worker Deployment
  - Job Monitoring
  - Cron Security

### Sprint 5: Module Completion Part 1
- **Depends on**: Sprint 2
- **Blocks**: Sprint 6
- **Parallel Tasks**:
  - Attendance Module
  - Parents Module
  - Fees Module
  - Academics Interfaces

### Sprint 6: Module Completion Part 2
- **Depends on**: Sprint 5
- **Blocks**: Release
- **Parallel Tasks**:
  - Dashboard Module
  - Analytics Module
  - Communication Interfaces

### Sprint 7: Commercial SaaS
- **Depends on**: Sprint 3
- **Blocks**: None
- **Parallel Tasks**:
  - Billing UI
  - Invoice Generation
  - Payment History
  - Proration Logic

### Sprint 8: AI Platform
- **Depends on**: Sprint 4
- **Blocks**: None
- **Parallel Tasks**:
  - Prompt Templates
  - Content Moderation
  - Streaming
  - Conversation History

### Sprint 9: Testing & Compliance
- **Depends on**: Sprint 1, Sprint 2
- **Blocks**: Sprint 10
- **Parallel Tasks**:
  - Integration Tests
  - E2E Tests
  - Audit Expansion

### Sprint 10: Production Hardening
- **Depends on**: Sprint 9
- **Blocks**: Release
- **Parallel Tasks**:
  - Performance Optimization
  - Monitoring Setup
  - Documentation
  - Security Audit

---

## 6. Critical Resource Dependencies

### 6.1 Personnel Dependencies

| Role | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5-6 | Sprint 7 | Sprint 8 | Sprint 9-10 |
|------|----------|----------|----------|----------|------------|---------|---------|-------------|
| Platform Lead | Required | Required | Required | Required | Required | Required | Required | Required |
| Security Engineer | — | Required | Required | — | — | — | — | Required |
| Backend Engineer | Required | Required | Required | Required | Required | — | — | Required |
| Backend Engineer 2 | Required | Required | Required | Required | Required | — | — | Required |
| Backend Engineer 3 | Required | Required | — | — | Required | — | — | Required |
| Backend Engineer 4 | Required | Required | — | — | Required | — | — | Required |
| AI Engineer | — | — | — | — | — | — | Required | — |
| QA/DevOps | — | — | — | — | — | Required | — | Required |

### 6.2 Infrastructure Dependencies

| Resource | Sprint | Dependency |
|----------|--------|------------|
| CI/CD Pipeline | Sprint 1 | DevOps |
| Test Environment | Sprint 1 | Firebase Test Project |
| Staging Environment | Sprint 1 | Cloud Infrastructure |
| Event Bus Persistence | Sprint 3 | Database (Redis/Firestore) |
| Worker Infrastructure | Sprint 4 | Container Platform |
| Monitoring Stack | Sprint 10 | Observability Platform |

---

## 7. Risk-Adjusted Timeline

### 7.1 Optimistic Scenario

| Phase | Duration | Key Assumptions |
|-------|----------|-----------------|
| Foundation | 8 weeks | No major blockers, team fully staffed |
| Platform & Core | 8 weeks | Modules straightforward to refactor |
| Commercial & AI | 6 weeks | Third-party APIs stable |
| Quality & Launch | 6 weeks | Testing goes smoothly |
| **Total** | **28 weeks** | — |

### 7.2 Realistic Scenario

| Phase | Duration | Key Assumptions |
|-------|----------|-----------------|
| Foundation | 10 weeks | Some refactoring complexity |
| Platform & Core | 10 weeks | Module interfaces require iteration |
| Commercial & AI | 8 weeks | Stripe/AI integrations need refinement |
| Quality & Launch | 8 weeks | Testing reveals some issues |
| **Total** | **36 weeks** | — |

### 7.3 Pessimistic Scenario

| Phase | Duration | Key Assumptions |
|-------|----------|-----------------|
| Foundation | 14 weeks | Major refactoring challenges, staff turnover |
| Platform & Core | 14 weeks | Complex module dependencies discovered |
| Commercial & AI | 10 weeks | Third-party API changes, compliance delays |
| Quality & Launch | 10 weeks | Extensive security findings, performance issues |
| **Total** | **48 weeks** | — |

---

## 8. Contingency Planning

### 8.1 Critical Path Slippage

If critical path tasks slip:
- **Week 2 delay**: Reduce Track E scope (defer non-critical modules)
- **Week 4 delay**: Parallelize Tracks F and G earlier (accept security risk)
- **Week 6 delay**: Defer Sprint 10 optimization tasks, release with monitoring gaps
- **Week 8+ delay**: Re-evaluate scope, consider phased release

### 8.2 Resource Constraints

If engineers are unavailable:
- **1 engineer short**: Defer Track H (DX) to post-launch
- **2 engineers short**: Defer Sprint 10 optimization, focus on core deliverables
- **Security engineer unavailable**: Engage external security consultant for Sprint 2-3

### 8.3 Technical Blockers

If major technical issues arise:
- **Architecture refactor breaks features**: Roll back to Sprint 1 baseline, incrementally reapply
- **Event system data loss**: Disable events, continue with synchronous operations, fix offline
- **Worker deployment fails**: Continue with synchronous blocking, defer workers to post-launch

---

## 9. Milestone Dependencies

| Milestone | Depends On | Gates |
|-----------|-----------|-------|
| Architecture Baseline | Sprint 1 | Architecture tests pass, lint passes |
| Security Baseline | Sprint 2 | Security scan clean, auth tests pass |
| Platform Baseline | Sprint 4 | Workers running, events processing |
| Module Complete | Sprint 6 | All modules at gold standard |
| Commercial Ready | Sprint 7 | Stripe test mode passes end-to-end |
| AI Ready | Sprint 8 | AI safety review passed |
| QA Ready | Sprint 9 | Integration tests pass, E2E tests pass |
| Release Candidate | Sprint 10 | Performance benchmarks met, security audit clean |

---

## 10. Conclusion

The dependency graph reveals that Track A (Architecture Foundation) is the single most critical investment. Delays in Sprint 1 cascade through all subsequent work. The parallel track structure maximizes engineering productivity while maintaining necessary sequencing for security and platform stability.

Success requires strict adherence to the critical path, proactive risk management, and disciplined scope control.
