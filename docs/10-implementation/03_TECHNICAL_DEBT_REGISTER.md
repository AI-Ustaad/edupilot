# Technical Debt Register

**Date**: 2026-07-26T11:06:57.022186  
**Status**: Final  
**Owner**: CTO Office

---

## Debt Classification

| Category | Items | Severity | Remediation Effort |
| --- | --- | --- | --- |
| Security Debt | 6 items | CRITICAL/HIGH | 3-4 weeks |
| Architecture Debt | 8 items | HIGH/MEDIUM | 4-6 weeks |
| Code Quality Debt | 12+ items | MEDIUM | 2-3 weeks |
| Testing Debt | 3 categories | HIGH | 6-8 weeks |
| Observability Debt | 3 categories | HIGH | 2-3 weeks |
| DevOps Debt | 5 categories | HIGH | 3-4 weeks |
| AI Debt | 4 items | MEDIUM | 2-3 weeks |
| SaaS Debt | 5 items | MEDIUM | 2-3 weeks |

## Detailed Debt Items

| ID | Debt Item | Category | Severity | Location | Effort (SP) |
| --- | --- | --- | --- | --- | --- |
| TD-001 | Role escalation in register-user | Security | HIGH | auth/register-user/route.ts | ✅ FIXED |
| TD-002 | No auth on curriculum/engine | Security | CRITICAL | curriculum/engine/route.ts | ✅ FIXED |
| TD-003 | No auth on education/rules | Security | CRITICAL | education/rules/route.ts | ✅ FIXED |
| TD-004 | adminDb in 7 routes | Security | MEDIUM | Public/auth/cron routes | 0 |
| TD-005 | adminDb in 6 services | Security | HIGH | Multiple services | 6 |
| TD-006 | Hardcoded CRON_SECRET | Security | HIGH | jobs/attendance-report/route.ts | ✅ FIXED |
| TD-007 | No refresh tokens | Security | MEDIUM | lib/auth/auth-server.ts | 5 |
| TD-008 | No MFA/2FA | Security | LOW | N/A | 8 |
| TD-009 | Dead BaseService | Code Quality | MEDIUM | services/base.service.ts | ✅ FIXED |
| TD-010 | Dead IOCRService | Code Quality | MEDIUM | interfaces/IOCRService.ts | ✅ FIXED |
| TD-011 | Dead DTOs (6 items) | Code Quality | MEDIUM | dto/*.ts | 2 |
| TD-012 | Duplicate job.service | Code Quality | MEDIUM | services/job.service.ts | 3 |
| TD-013 | Duplicate configuration.service | Code Quality | MEDIUM | services/configuration*.ts | 3 |
| TD-014 | Routes bypassing services (~30) | Architecture | HIGH | Multiple routes | 10 |
| TD-015 | Missing interfaces (29 services) | Architecture | HIGH | services/*.ts | 15 |
| TD-016 | Missing interfaces (18 repos) | Architecture | MEDIUM | repositories/*.ts | 10 |
| TD-017 | No Redis caching | Performance | MEDIUM | N/A | 8 |
| TD-018 | No integration tests | Testing | HIGH | N/A | 13 |
| TD-019 | No E2E tests | Testing | HIGH | N/A | 13 |
| TD-020 | No monitoring/observability | DevOps | HIGH | N/A | 8 |
| TD-021 | No CI/CD pipeline | DevOps | HIGH | N/A | 5 |
| TD-022 | No backup strategy | DevOps | HIGH | N/A | 5 |
| TD-023 | No DR plan | DevOps | HIGH | N/A | 5 |
| TD-024 | No AI fallback provider | AI | MEDIUM | lib/ai/providers/ | 3 |
| TD-025 | No AI streaming | AI | MEDIUM | lib/ai/gateway/ | 5 |
| TD-026 | No invoice generation | SaaS | MEDIUM | services/ | 5 |
| TD-027 | No payment history | SaaS | MEDIUM | services/ | 3 |
| TD-028 | No proration logic | SaaS | MEDIUM | services/ | 5 |

## Debt Summary

Total Technical Debt Items: 19 remaining (9 resolved)
Total Story Points: ~133 SP remaining (17 SP resolved)
Estimated Timeline: 6-9 months with 4-person team

