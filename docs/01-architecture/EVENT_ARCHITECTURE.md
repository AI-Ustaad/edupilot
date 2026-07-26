# Event Architecture

**Document ID**: EDU-EVTARCH-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Event System Overview

EduPilot implements an event-driven architecture using an outbox pattern for reliability.

## 2. Event Bus Implementation

| Component | File | Status | Evidence |
|-----------|------|--------|----------|
| EventBus class | lib/events/event-bus.ts | ✅ Active | EDUPILOT_MASTER_FACTS.md |
| EventOutboxRepository | repositories/event-outbox.repository.ts | ✅ Active | EDUPILOT_MASTER_FACTS.md |
| EventWorker | lib/workers/event.worker.ts | ✅ Active | EDUPILOT_EVENT_CATALOG.md |
| Event Types | lib/events/event-types.ts | ✅ Active | 30+ event types |
| Subscribers | lib/subscribers/*.ts | ✅ Active | 5 subscriber files |

## 3. Event Flow

```mermaid
graph LR

```

    A[Publisher Service] -->|publish| B[EventBus]
    B -->|enqueue| C[EventOutboxRepository]
    C -->|persist| D[Firestore]
    E[EventWorker] -->|poll| C
    E -->|claim| C
    E -->|dispatch| B
    B -->|notify| F[Subscribers]
    F --> G[AuditSubscriber]
    F --> H[NotificationSubscriber]
    F --> I[LifecycleSubscriber]
    F --> J[StaffLifecycleSubscriber]
    F --> K[DashboardSubscriber]
```

## 4. Publishers (15 services)

| Service | Events | Evidence |
|---------|--------|----------|
| StudentService | STUDENT_CREATED, UPDATED, DELETED | EDUPILOT_EVENT_CATALOG.md |
| StaffService | STAFF_CREATED, UPDATED, DELETED | EDUPILOT_EVENT_CATALOG.md |
| AttendanceService | ATTENDANCE_MARKED, UPDATED | EDUPILOT_EVENT_CATALOG.md |
| FeesService | FEE_CREATED, FEE_PAID | EDUPILOT_EVENT_CATALOG.md |
| AssignmentService | ASSIGNMENT_POSTED | EDUPILOT_EVENT_CATALOG.md |
| HomeworkService | HOMEWORK_POSTED | EDUPILOT_EVENT_CATALOG.md |
| ExamService | EXAM_CREATED, PUBLISHED | EDUPILOT_EVENT_CATALOG.md |
| MarkService | RESULT_PUBLISHED | EDUPILOT_EVENT_CATALOG.md |
| NoticeService | NOTICE_POSTED | EDUPILOT_EVENT_CATALOG.md |
| EventService | EVENT_CREATED | EDUPILOT_EVENT_CATALOG.md |
| MessageService | MESSAGE_SENT | EDUPILOT_EVENT_CATALOG.md |
| BlogService | BLOG_POSTED | EDUPILOT_EVENT_CATALOG.md |
| VideoLectureService | VIDEO_LECTURE_POSTED | EDUPILOT_EVENT_CATALOG.md |
| TimetableService | TIMETABLE_UPDATED | EDUPILOT_EVENT_CATALOG.md |
| BusService | ROUTE_UPDATED | EDUPILOT_EVENT_CATALOG.md |

