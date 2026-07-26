# EduPilot Event Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of all events, publishers, and subscribers

---

## Event Bus

| Property | Value | Evidence |
|----------|-------|----------|
| Implementation | EventBus class with outbox pattern | lib/events/event-bus.ts |
| Persistence | EventOutboxRepository | lib/events/event-bus.ts |
| Dispatch | EventWorker processes events | lib/workers/event.worker.ts |

## Publishers (15 services)

| Service | Events Published | Evidence |
|---------|------------------|----------|
| StudentService | STUDENT_CREATED, STUDENT_UPDATED, STUDENT_DELETED | services/StudentService.ts |
| StaffService | STAFF_CREATED, STAFF_UPDATED, STAFF_DELETED | services/StaffService.ts |
| AttendanceService | ATTENDANCE_MARKED, ATTENDANCE_UPDATED | services/attendance.service.ts |
| FeesService | FEE_CREATED, FEE_PAID | services/fees.service.ts |
| AssignmentService | ASSIGNMENT_POSTED | services/assignment.service.ts |
| HomeworkService | HOMEWORK_POSTED | services/homework.service.ts |
| ExamService | EXAM_CREATED, EXAM_PUBLISHED | services/exam.service.ts |
| MarkService | RESULT_PUBLISHED | services/marks.service.ts |
| NoticeService | NOTICE_POSTED | services/notice.service.ts |
| EventService | EVENT_CREATED | services/event.service.ts |
| MessageService | MESSAGE_SENT | services/message.service.ts |
| BlogService | BLOG_POSTED | services/blog.service.ts |
| VideoLectureService | VIDEO_LECTURE_POSTED | services/video-lecture.service.ts |
| TimetableService | TIMETABLE_UPDATED | services/timetable.service.ts |
| BusService | ROUTE_UPDATED | services/bus.service.ts |

## Subscribers (5 files)

| Subscriber | File | Events Handled |
|------------|------|----------------|
| AuditSubscriber | lib/subscribers/audit.subscriber.ts | All events |
| NotificationSubscriber | lib/events/subscribers/notification.subscriber.ts | Multiple events |
| LifecycleSubscriber | lib/subscribers/lifecycle.subscriber.ts | Student events |
| StaffLifecycleSubscriber | lib/subscribers/staff-lifecycle.subscriber.ts | Staff events |
| DashboardSubscriber | lib/subscribers/dashboard.subscriber.ts | Aggregation events |

## Event Flow

```
Publisher Service
  → eventBus.publish(eventType, payload)
    → EventOutboxRepository.enqueue()
      → EventWorker.process()
        → eventBus.dispatch(event)
          → Subscribers handle event
```

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
