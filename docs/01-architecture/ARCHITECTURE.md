# Architecture Overview

**Document ID**: EDU-ARCH-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Architecture Pattern

EduPilot follows a **layered architecture** with the following layers:

```
Routes (API/Pages)
  ↓
Middleware (Auth, Tenant, Permission, Error)
  ↓
Services (Business Logic)
  ↓
Repositories (Data Access)
  ↓
Firebase Firestore (Database)
```

## 2. Current State

| Layer | Status | Coverage | Evidence |
| --- | --- | --- | --- |
| Routes | ✅ Implemented | 117 API routes | EDUPILOT_MASTER_FACTS.md |
| Middleware | ✅ Implemented | withAuth, withPermission, withTenant | EDUPILOT_SECURITY_CATALOG.md |
| Services | ⚠️ Partial | 7/36 with interfaces | EDUPILOT_MASTER_FACTS.md |
| Repositories | ⚠️ Partial | 14/32 with interfaces | EDUPILOT_MASTER_FACTS.md |
| Entities | ⚠️ Partial | 5 entities | EDUPILOT_MASTER_FACTS.md |
| DTOs | ⚠️ Partial | 20 DTOs | EDUPILOT_MASTER_FACTS.md |
| Mappers | ⚠️ Partial | 13 mappers | EDUPILOT_MASTER_FACTS.md |

## 3. Architecture Violations

| Violation | Count | Severity | Evidence |
| --- | --- | --- | --- |
| Routes bypassing services | ~30 | HIGH | EDUPILOT_MASTER_FACTS.md |
| Routes using adminDb directly | 14 | HIGH | EDUPILOT_API_CATALOG.md |
| Services using adminDb directly | 6 | HIGH | EDUPILOT_MASTER_FACTS.md |
| Dead implementations | 12+ | MEDIUM | EDUPILOT_MASTER_FACTS.md |
| Duplicate implementations | 2 | MEDIUM | EDUPILOT_MASTER_FACTS.md |

