# Dependency Graph

**Document ID**: EDU-DEP-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Module Dependencies

```mermaid
graph TD

```

    Students --> Attendance
    Students --> Fees
    Students --> Parents
    Students --> Dashboard
    Staff --> Attendance
    Staff --> Timetable
    Staff --> Dashboard
    Attendance --> Dashboard
    Fees --> Dashboard
    Parents --> Dashboard
    Exams --> Dashboard
    Assignments --> Dashboard
    Homework --> Dashboard
    Dashboard --> Analytics
    All --> Events
    All --> Notifications
    All --> Audit
```

## 2. Service Dependencies

| Service | Depends On (Repositories) | Depends On (Services) | Evidence |
| --- | --- | --- | --- |
| StudentService | StudentRepository | AttendanceService, FeesService | EDUPILOT_MASTER_FACTS.md |
| StaffService | StaffRepository | AttendanceService | EDUPILOT_MASTER_FACTS.md |
| AttendanceService | AttendanceRepository | StudentRepository, StaffRepository | EDUPILOT_MASTER_FACTS.md |
| FeesService | FeeRepository | StudentRepository | EDUPILOT_MASTER_FACTS.md |
| DashboardService | Multiple | All domain services | EDUPILOT_MASTER_FACTS.md |
| AnalyticsService | Multiple | All domain services | EDUPILOT_MASTER_FACTS.md |

## 3. Critical Violations

| Violation | Count | Impact | Evidence |
| --- | --- | --- | --- |
| Routes calling repositories directly | ~30 | Bypasses business logic | EDUPILOT_IMPORT_GRAPH.md |
| Routes calling adminDb directly | 14 | Bypasses repositories | EDUPILOT_API_CATALOG.md |
| Services calling adminDb directly | 6 | Bypasses repositories | EDUPILOT_MASTER_FACTS.md |
| Service-to-service imports | Multiple | Tight coupling | EDUPILOT_MASTER_FACTS.md |

