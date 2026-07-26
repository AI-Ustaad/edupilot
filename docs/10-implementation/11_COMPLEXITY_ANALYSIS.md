# Complexity Analysis

**Date**: 2026-07-26T11:08:50.569189  
**Status**: Final  
**Owner**: CTO Office

---

## Complexity Distribution

| Complexity | Count | SP Range | Examples |
| --- | --- | --- | --- |
| Low | 15 items | 1-3 SP | Remove dead code, fix hardcoded secrets, add CSRF |
| Medium | 18 items | 3-5 SP | Refresh tokens, mappers, DTOs, payment history |
| High | 12 items | 5-8 SP | adminDb migration, interfaces, Redis, monitoring |
| Very High | 5 items | 8+ SP | Integration tests, E2E tests, MFA, DR plan |

## Complexity by Category

| Category | Low | Medium | High | Very High | Avg SP |
| --- | --- | --- | --- | --- | --- |
| Security | 3 | 2 | 2 | 2 | 5.5 |
| Architecture | 2 | 3 | 3 | 1 | 5.0 |
| Testing | 0 | 1 | 0 | 2 | 13.0 |
| DevOps | 0 | 2 | 2 | 1 | 7.0 |
| AI | 0 | 1 | 1 | 1 | 4.5 |
| SaaS | 0 | 3 | 0 | 0 | 4.3 |

## Risk Factors

- **Security fixes**: High risk, require careful testing
- **adminDb migration**: High complexity, touches 20 files
- **Interface addition**: Medium complexity, widespread changes
- **Test creation**: High effort, requires test infrastructure
- **Monitoring**: Medium complexity, requires external services

