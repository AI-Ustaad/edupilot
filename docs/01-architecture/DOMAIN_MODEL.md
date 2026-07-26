# Domain Model

**Document ID**: EDU-DOMAIN-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Domain Structure

EduPilot is organized into the following bounded contexts:

| Bounded Context | Modules | Core Entities | Evidence |
| --- | --- | --- | --- |
| Academic | Students, Staff, Attendance, Parents, Fees | Student, Staff, Attendance, Fee, Parent | EDUPILOT_MODULE_CATALOG.md |
| Academics | Exams, Assignments, Homework, Marks, Timetable | Exam, Assignment, Homework, Mark, Timetable | EDUPILOT_MODULE_CATALOG.md |
| Communication | Notices, Events, Messages, Blog, Video Lectures | Notice, Event, Message, Blog, VideoLecture | EDUPILOT_MODULE_CATALOG.md |
| Infrastructure | Library, Transport, Hostel | Book, Bus, Route, Hostel, Room | EDUPILOT_MODULE_CATALOG.md |
| Platform | Dashboard, Analytics, AI, Events, Notifications | Dashboard metrics, Analytics, AI agents | EDUPILOT_MODULE_CATALOG.md |
| SaaS | Tenants, Subscriptions, Billing, Feature Flags | Tenant, Subscription, Plan, FeatureFlag | EDUPILOT_SAAS_CATALOG.md |
| Security | Auth, RBAC, Sessions, Permissions | User, Role, Permission, Session | EDUPILOT_SECURITY_CATALOG.md |

## 2. Entity Relationships

```mermaid
erDiagram
    TENANT ||--o{ STUDENT : has
    TENANT ||--o{ STAFF : has
    TENANT ||--o{ CLASS : has
    STUDENT ||--o{ ATTENDANCE : has
    STUDENT ||--o{ FEE : has
    STUDENT ||--o{ MARK : has
    STAFF ||--o{ ATTENDANCE : has
    STAFF ||--o{ TIMETABLE : has
    PARENT ||--o{ STUDENT : has
    CLASS ||--o{ SUBJECT : has
    CLASS ||--o{ TIMETABLE : has
```

