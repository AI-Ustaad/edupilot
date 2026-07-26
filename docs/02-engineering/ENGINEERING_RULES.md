# Engineering Rules

**Document ID**: EDU-ENGR-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Golden Rule

**All code must be verified against EDUPILOT_MASTER_FACTS.md. No implementation without evidence.**

## 2. Mandatory References

Before implementing any feature, consult:
- EDUPILOT_MASTER_FACTS.md — Current state of all components
- EDUPILOT_API_CATALOG.md — Existing API routes
- EDUPILOT_MODULE_CATALOG.md — Module structure
- EDUPILOT_SECURITY_CATALOG.md — Security requirements
- EDUPILOT_DEPENDENCY_INDEX.md — Dependencies

## 3. Prohibited Patterns

| Pattern | Reason | Enforcement |
| --- | --- | --- |
| Routes calling repositories directly | Bypasses business logic | Architecture tests |
| Services calling adminDb directly | Bypasses repositories | Code review |
| Business logic in repositories | Violates separation of concerns | Code review |
| Dead code left in codebase | Increases maintenance burden | Lint rules |
| Duplicate implementations | Causes confusion | Architecture tests |
| Split-brain validation | Inconsistent validation | Code review |

## 4. Mandatory Patterns

| Pattern | Requirement | Enforcement |
| --- | --- | --- |
| Service interfaces | All services must implement interfaces | Architecture tests |
| Repository interfaces | All repositories must implement interfaces | Architecture tests |
| DTOs for input/output | All endpoints must use DTOs | Code review |
| Mappers for persistence | All persistence via mappers | Code review |
| Event publishing | All mutations must publish events | Architecture tests |
| Tenant scoping | All queries must include tenantId | Architecture tests |
| Error handling | Use AppError hierarchy | Lint rules |
| Response format | Use createSuccessResponse/createErrorResponse | Lint rules |

