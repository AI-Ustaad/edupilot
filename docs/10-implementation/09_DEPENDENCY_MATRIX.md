# Dependency Matrix

**Date**: 2026-07-26T11:08:18.077506  
**Status**: Final  
**Owner**: CTO Office

---

## Task Dependencies

| Task | Depends On | Blocks | Critical Path |
| --- | --- | --- | --- |
| CI/CD pipeline | None | All automation | Yes |
| Auth bypass fixes | None | Security hardening | Yes |
| adminDb migration | CI/CD | Security | Yes |
| Service interfaces | None | Testing, DI | No |
| Repository interfaces | None | Testing, DI | No |
| Integration tests | Security, interfaces | E2E tests | Yes |
| E2E tests | Integration tests | Release | Yes |
| Monitoring | None | Production | Yes |
| AI fallback | None | AI reliability | No |
| Invoices | None | Billing | No |

## Critical Path

Sprint 1: CI/CD → Auth fixes → Dead code removal
Sprint 2: adminDb migration → Service bypass fixes
Sprint 3: Interfaces → Integration tests
Sprint 5: Monitoring → Production visibility
Sprint 6: Integration tests → E2E tests
Sprint 10: All previous → Release candidate

