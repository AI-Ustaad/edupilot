# Firestore Standards

**Document ID**: EDU-FIRESTORE-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Access Rules

| Rule | Description | Enforcement |
| --- | --- | --- |
| No direct Firestore from routes | Routes must use repositories | Architecture tests |
| Tenant filter required | All queries must include tenantId | Architecture tests |
| Indexes required | Composite indexes for all queries | CI/CD |
| Batch operations | Use batch for multi-document writes | Code review |

## 2. Query Patterns

```typescript
// Correct: Repository with tenant filter
async findByTenant(tenantId: string) {
  return this.db.collection('students')
    .where('tenantId', '==', tenantId)
    .get();
}
```

