# Repository Pattern

**Document ID**: EDU-REPO-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Pattern Definition

Repositories provide data access abstraction. All Firestore access must go through repositories.

## 2. BaseRepository

| Method | Signature | Purpose |
| --- | --- | --- |
| create | (tenantId: string, data: any) => Promise<T> | Create new document |
| findById | (tenantId: string, id: string) => Promise<T | null> | Find by ID |
| findAll | (tenantId: string, filters?: any) => Promise<T[]> | Find all matching |
| update | (tenantId: string, id: string, data: any) => Promise<T> | Update document |
| delete | (tenantId: string, id: string) => Promise<void> | Delete document |
| count | (tenantId: string, filters?: any) => Promise<number> | Count documents |

## 3. Violations

| Repository | Violation | Evidence |
|------------|-----------|----------|
| 8 repositories | Do not extend BaseRepository | EDUPILOT_MASTER_FACTS.md |
| 6 services | Call adminDb directly | EDUPILOT_MASTER_FACTS.md |
| 14 routes | Call adminDb directly | EDUPILOT_API_CATALOG.md |

