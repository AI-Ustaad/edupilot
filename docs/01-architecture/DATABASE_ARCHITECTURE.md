# Database Architecture

**Document ID**: EDU-DBARCH-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Database Technology

| Property | Value | Evidence |
|----------|-------|----------|
| Database | Firebase Firestore | lib/firebase-admin.ts |
| Model | NoSQL, document-based | Firestore documentation |
| Schema | Shared schema, tenant-scoped | EDUPILOT_MASTER_FACTS.md |
| Indexing | Composite indexes for queries | firestore.indexes.json |

## 2. Collection Structure

| Collection | Purpose | Tenant Scoped | Evidence |
|------------|---------|---------------|----------|
| users | User accounts | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| students | Student records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| staff | Staff records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| attendance | Attendance records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| fees | Fee records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| exams | Exam records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| classes | Class definitions | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |
| ai_usage | AI usage tracking | Yes (tenantId field) | EDUPILOT_AI_CATALOG.md |
| events | Event outbox | Yes (tenantId field) | EDUPILOT_EVENT_CATALOG.md |
| audit_logs | Audit trail | Yes (tenantId field) | EDUPILOT_SECURITY_CATALOG.md |

## 3. Multi-Tenancy Strategy

- **Shared Database**: All tenants share Firestore project
- **Shared Schema**: All collections have tenantId field
- **Row-Level Filtering**: Application-level WHERE tenantId = ?
- **No Encryption at Rest**: Data isolation via query filtering only
- **Connection Pooling**: Shared Firestore connections

