# Architecture Refactor Plan

**Date**: 2026-07-26T11:09:27.156790  
**Status**: Final  
**Owner**: CTO Office

---

## Current State

Current architecture violates multiple enterprise patterns:
- 14 routes bypass service layer
- 6 services use adminDb directly
- Only 19% of services have interfaces
- Only 44% of repositories have interfaces
- 12+ dead implementations
- 2 duplicate implementations

## Refactor Strategy

| Refactor | Current | Target | Priority | Sprint | Effort |
| --- | --- | --- | --- | --- | --- |
| Service layer enforcement | ~30 routes bypass | All routes use services | P0 | 2-3 | 10 SP |
| Repository pattern enforcement | 6 services use adminDb | All data via repositories | P0 | 1-2 | 14 SP |
| Service interfaces | 7/36 (19%) | 36/36 (100%) | P1 | 3-4 | 15 SP |
| Repository interfaces | 14/32 (44%) | 32/32 (100%) | P1 | 4 | 10 SP |
| Dead code removal | 12+ items | 0 items | P1 | 1 | 2 SP |
| Duplicate consolidation | 2 pairs | 0 pairs | P1 | 2 | 6 SP |
| DTO completeness | Some missing | All modules covered | P1 | 3 | 2 SP |
| Mapper completeness | 3 missing | All modules covered | P1 | 3 | 3 SP |
| Dependency injection | Manual | Constructor injection | P2 | 4-5 | 8 SP |
| Event publishing coverage | 15 publishers | All mutations | P1 | 3-4 | 5 SP |

## Refactor Rules

1. No route may call a repository directly
2. No service may call adminDb directly
3. All services must implement interfaces
4. All repositories must implement interfaces
5. All mutations must publish events
6. All queries must include tenantId
7. All input/output must use DTOs
8. All persistence must use mappers

