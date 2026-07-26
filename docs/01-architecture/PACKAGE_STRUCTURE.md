# Package Structure

**Document ID**: EDU-PKG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Directory Layout

```
app/
  api/v1/                    # 117 API routes
    students/
    staff/
    attendance/
    ...
  (protected)/               # 87 protected pages
    dashboard/
    students/
    ...

services/                    # 36 service files
  StudentService.ts
  StaffService.ts
  ...

repositories/                # 32 repository files
  student.repository.ts
  staff.repository.ts
  ...

interfaces/                  # 23 interface files
  IStudentService.ts
  IStudentRepository.ts
  ...

entities/                    # 5 entity files
documents/                   # 5+ document files
dto/                         # 20 DTO files
lib/mappers/                 # 13 mapper files
validators/                  # 22 validator files
hooks/                       # 43 hook files
lib/events/                  # Event bus, types, outbox
lib/subscribers/             # 5 subscriber files
lib/workers/                 # 2 worker files
lib/ai/                      # AI providers, strategies, prompts
route-helpers/               # Middleware functions
context/                     # React contexts
components/                  # Shared UI components
```

## 2. Layer Separation Rules

| Rule | Description | Status |
|------|-------------|--------|
| Routes → Services | All business logic in services | ⚠️ Partial — 30 routes bypass |
| Services → Repositories | All data access via repositories | ⚠️ Partial — 6 services use adminDb |
| Repositories → Firestore | All DB access via repositories | ✅ Enforced |
| No service-to-service | Services must not import services | ⚠️ Violated |
| No repository-to-service | Repositories must not import services | ✅ Enforced |

