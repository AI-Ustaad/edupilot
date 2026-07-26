# Implementation Phases

**Document ID**: EDU-PHASE-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Phase Overview

| Phase | Name | Duration | Goal | Exit Criteria |
| --- | --- | --- | --- | --- |
| Phase 1 | Foundation | Q4 2026 | Architecture + Security | Health scores >7/10 |
| Phase 2 | Platform | Q1 2027 | Events + Jobs + Testing | 80% test coverage |
| Phase 3 | Academic Core | Q2 2027 | All modules gold standard | All modules 9/10+ |
| Phase 4 | Commercial | Q3 2027 | Billing + AI production | Revenue flowing |
| Phase 5 | Launch | Q4 2027 | Production readiness | 99.9% uptime, SOC 2 |

## 2. Phase 1: Foundation (Q4 2026)

**Sprint 1**: Architecture Stabilization
- Remove dead code (BaseService, IOCRService, 5 DTOs, 5 validators)
- Remove duplicates (job.service.ts, configuration.service.ts)
- Consolidate validation schemas
- Complete barrel exports
- Fix dependency direction violations

**Sprint 2**: Security Foundation
- Harden auth middleware
- Add refresh tokens
- Fix 14 no-auth routes
- Fix tenant leak
- Remove CRON_SECRET from code

## 3. Phase 2: Platform (Q1 2027)

**Sprint 3**: Event System
- Implement event publishers in all services
- Harden event bus (persistence, error isolation, schema validation)
- Process dead letter queue

**Sprint 4**: Background Jobs
- Deploy workers
- Job monitoring
- Retry alerts

## 4. Phase 3: Academic Core (Q2 2027)

**Sprint 5-6**: Module Completion
- Complete Attendance, Parents, Fees modules
- Complete Academics interfaces (8 services)
- Refactor Dashboard, Analytics
- Complete Communication interfaces

## 5. Phase 4: Commercial (Q3 2027)

**Sprint 7**: Billing
- Upgrade/downgrade UI
- Invoice generation
- Payment history

**Sprint 8**: AI Production
- Prompt templates
- Content moderation
- Streaming responses
- Conversation history

## 6. Phase 5: Launch (Q4 2027)

**Sprint 9**: Quality & Compliance
- Integration tests (80% coverage)
- E2E tests
- SOC 2 readiness

**Sprint 10**: Production Hardening
- Performance optimization
- Monitoring and observability
- Documentation
- Release Candidate

