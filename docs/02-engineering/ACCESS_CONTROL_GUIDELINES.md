# Access Control Guidelines

**Document ID**: EDU-ACG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## RBAC Rules

| Role | Access Level | Evidence |
| --- | --- | --- |
| SUPER_ADMIN | Full system access | EDUPILOT_SECURITY_CATALOG.md |
| ADMIN | School-level admin | EDUPILOT_SECURITY_CATALOG.md |
| TEACHER | Teacher-level access | EDUPILOT_SECURITY_CATALOG.md |
| PARENT | Parent-level access | EDUPILOT_SECURITY_CATALOG.md |
| STUDENT | Student-level access | EDUPILOT_SECURITY_CATALOG.md |

## Permission Pattern

All permissions follow `{domain}.{action}` pattern (e.g., `students.view`, `students.create`).

