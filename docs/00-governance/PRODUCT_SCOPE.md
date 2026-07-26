# Product Scope

**Document ID**: EDU-SCOPE-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. In Scope

| Module | Features | Status | Evidence |
| --- | --- | --- | --- |
| Student Management | CRUD, bulk import, OCR, promotion | ✅ Active | EDUPILOT_MODULE_CATALOG.md |
| Staff Management | CRUD, roles, assignments | ✅ Active | EDUPILOT_MODULE_CATALOG.md |
| Attendance | Mark, reports, bulk operations | ✅ Active | EDUPILOT_MODULE_CATALOG.md |
| Fees | Invoices, payments, reminders | ✅ Active | EDUPILOT_MODULE_CATALOG.md |
| Exams | Scheduling, results, reports | ✅ Active | EDUPILOT_MODULE_CATALOG.md |
| AI Platform | Chatbot, exam generator, timetable AI | ✅ Active | EDUPILOT_AI_CATALOG.md |
| Multi-Tenancy | Tenant isolation, subscriptions | ✅ Active | EDUPILOT_SAAS_CATALOG.md |
| RBAC | Roles, permissions, middleware | ✅ Active | EDUPILOT_SECURITY_CATALOG.md |

## 2. Out of Scope

- Mobile native apps (iOS/Android)
- Third-party LMS integrations (planned for v2.0)
- Advanced analytics BI tools (planned for v2.0)
- Custom domain white-labeling (planned for Q2 2027)

## 3. Current Limitations

⚠️ **Architecture: Only 2 of 12 modules follow gold standard pattern**

⚠️ **Testing: ~5% coverage, no integration/E2E tests**

🚫 **Security: 14 routes bypass auth, 6 services call adminDb directly**

ℹ️ **Events: 15 publishers exist but event system partially wired**

