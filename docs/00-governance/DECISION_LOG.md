# Architectural Decision Log

**Document ID**: EDU-ADL-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## Recorded Decisions

| ID | Date | Decision | Rationale | Status | Impact |
| --- | --- | --- | --- | --- | --- |
| ADL-001 | 2026-07-26 | Adopt Repository Pattern with BaseRepository | Consistent data access, tenant scoping | Accepted | All modules |
| ADL-002 | 2026-07-26 | Use Firebase Firestore as primary database | Serverless, scalable, real-time | Accepted | All data persistence |
| ADL-003 | 2026-07-26 | Session cookie authentication with Firebase Admin | Secure, stateless, scalable | Accepted | All auth flows |
| ADL-004 | 2026-07-26 | Event-driven architecture with outbox pattern | Reliability, decoupling, audit | Accepted | Event system |
| ADL-005 | 2026-07-26 | Gemini as primary AI provider | Cost, performance, features | Accepted | AI platform |
| ADL-006 | 2026-07-26 | Multi-tenancy via shared schema + tenantId | Cost effective, simpler operations | Accepted | All data |
| ADL-007 | 2026-07-26 | Next.js App Router for frontend | Modern React, server components | Accepted | Frontend |
| ADL-008 | 2026-07-26 | BullMQ for background jobs | Redis-based, reliable, observable | Accepted | Background processing |

## Pending Decisions

| ID | Decision | Options | Decision Date |
| --- | --- | --- | --- |
| ADL-009 | Refresh token implementation | JWT vs opaque tokens | Q4 2026 |
| ADL-010 | Event persistence strategy | Firestore vs dedicated event store | Q1 2027 |
| ADL-011 | AI fallback provider | OpenAI vs Anthropic vs Azure | Q1 2027 |
| ADL-012 | Test framework standardization | Jest vs Vitest | Q4 2026 |

