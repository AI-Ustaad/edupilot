# Enterprise Backlog

**Date**: 2026-07-26T11:07:27.882390  
**Status**: Final  
**Owner**: CTO Office

---

## Backlog Overview

Complete feature backlog derived from gap analysis and verified codebase state.

## Backlog Items

| ID | Title | Category | Priority | SP | Sprint |
| --- | --- | --- | --- | --- | --- |
| BL-001 | Fix role escalation in register-user | Security | P0 | 3 | ✅ DONE |
| BL-002 | Add auth to curriculum/engine | Security | P0 | 2 | Sprint 1 |
| BL-003 | Add auth to education/rules | Security | P0 | 2 | Sprint 1 |
| BL-004 | Migrate adminDb routes to standard pattern | Security | P0 | 8 | ✅ DONE |
| BL-005 | Migrate adminDb services to repositories | Security | P0 | 6 | Sprint 2 |
| BL-006 | Remove hardcoded CRON_SECRET | Security | P0 | 1 | ✅ DONE |
| BL-007 | Implement refresh token mechanism | Security | P1 | 5 | Sprint 2 |
| BL-008 | Implement MFA/2FA | Security | P2 | 8 | Sprint 5 |
| BL-009 | Remove dead BaseService | Code Quality | P1 | 1 | ✅ DONE |
| BL-010 | Remove dead IOCRService | Code Quality | P1 | 1 | ✅ DONE |
| BL-011 | Remove 6 dead DTOs | Code Quality | P1 | 2 | Sprint 1 |
| BL-012 | Consolidate duplicate job.service | Code Quality | P1 | 3 | Sprint 2 |
| BL-013 | Consolidate duplicate configuration.service | Code Quality | P1 | 3 | Sprint 2 |
| BL-014 | Fix ~30 routes bypassing services | Architecture | P0 | 10 | Sprint 2-3 |
| BL-015 | Add interfaces to 29 services | Architecture | P1 | 15 | Sprint 3-4 |
| BL-016 | Add interfaces to 18 repositories | Architecture | P1 | 10 | Sprint 4 |
| BL-017 | Add missing mappers (3 modules) | Architecture | P1 | 3 | Sprint 3 |
| BL-018 | Add missing DTOs (Dashboard, Analytics) | Architecture | P1 | 2 | Sprint 3 |
| BL-019 | Implement Redis caching | Performance | P1 | 8 | Sprint 4 |
| BL-020 | Add integration test suite | Testing | P0 | 13 | Sprint 3-5 |
| BL-021 | Add E2E test suite | Testing | P1 | 13 | Sprint 6-7 |
| BL-022 | Implement monitoring/observability | DevOps | P0 | 8 | Sprint 5 |
| BL-023 | Implement CI/CD pipeline | DevOps | P0 | 5 | Sprint 1 |
| BL-024 | Implement backup strategy | DevOps | P1 | 5 | Sprint 6 |
| BL-025 | Implement DR plan | DevOps | P1 | 5 | Sprint 7 |
| BL-026 | Add AI fallback provider | AI | P1 | 3 | Sprint 4 |
| BL-027 | Implement AI streaming | AI | P2 | 5 | Sprint 6 |
| BL-028 | Expand AI prompt library | AI | P2 | 5 | Sprint 5-6 |
| BL-029 | Implement invoice generation | SaaS | P1 | 5 | Sprint 5 |
| BL-030 | Implement payment history | SaaS | P1 | 3 | Sprint 5 |
| BL-031 | Implement proration logic | SaaS | P2 | 5 | Sprint 7 |
| BL-032 | Add server-side page protection | Security | P1 | 3 | Sprint 4 |
| BL-033 | Implement CSRF protection | Security | P1 | 2 | Sprint 4 |
| BL-034 | Add rate limiting to all public routes | Security | P1 | 3 | Sprint 3 |
| BL-035 | Implement account lockout | Security | P2 | 3 | Sprint 6 |
| BL-036 | Add input validation to all routes | Security | P1 | 5 | Sprint 3-4 |
| BL-037 | Implement audit logging for all mutations | Security | P1 | 5 | Sprint 4 |
| BL-038 | Add tenant isolation tests | Testing | P1 | 5 | Sprint 4 |
| BL-039 | Implement performance benchmarks | DevOps | P2 | 3 | Sprint 7 |
| BL-040 | Add health check endpoints | DevOps | P1 | 2 | Sprint 3 |

## Backlog Statistics

Total Items: 40
Total Story Points: ~180 SP
P0 (Critical): 8 items, 40 SP
P1 (High): 20 items, 95 SP
P2 (Medium): 12 items, 45 SP

