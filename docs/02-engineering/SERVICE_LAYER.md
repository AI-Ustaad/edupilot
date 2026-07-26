# Service Layer

**Document ID**: EDU-SVC-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Purpose

The service layer contains all business logic. Services orchestrate repositories and enforce business rules.

## 2. Service Contract

| Aspect | Requirement | Current Status |
| --- | --- | --- |
| Interface | All services implement interfaces | 7/36 (19%) |
| Constructor Injection | Dependencies injected via constructor | 7/36 (19%) |
| Parameter Order | tenantId, id, data, userId | Inconsistent |
| Return Types | DTOs, not entities | Partial |
| Error Handling | Throw AppError subclasses | Partial |
| Event Publishing | Publish domain events | 15/36 (42%) |

## 3. Forbidden Patterns

| Pattern | Why Forbidden | Enforcement |
| --- | --- | --- |
| Direct adminDb calls | Bypasses repository | Architecture tests |
| Business logic in routes | Violates separation of concerns | Code review |
| Service-to-service imports | Tight coupling | Architecture tests |
| Raw Firestore queries | No tenant enforcement | Architecture tests |

