#!/usr/bin/env python3
"""Generate remaining architecture documents"""
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
DOCS_ROOT = PROJECT_ROOT / "docs"

def write_doc(path, content):
    full_path = DOCS_ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content)
    print(f"Created: {path}")

def header(title, doc_id=None):
    h = f"# {title}\n\n"
    h += f"**Document ID**: EDU-{doc_id if doc_id else 'DOC'}-001  \n"
    h += f"**Version**: 1.0  \n"
    h += f"**Date**: 2026-07-26  \n"
    h += f"**Status**: Canonical  \n"
    h += f"**Owner**: CTO Office, EduPilot Engineering  \n"
    h += f"**Classification**: Internal — Engineering Governance  \n\n"
    h += "---\n\n"
    return h

def section(title, level=2):
    return f"{'#' * level} {title}\n\n"

def table(headers, rows):
    t = "| " + " | ".join(headers) + " |\n"
    t += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for row in rows:
        t += "| " + " | ".join(str(cell) for cell in row) + " |\n"
    t += "\n"
    return t

def mermaid(code):
    return f"```mermaid\n{code}\n```\n\n"

# EVENT_ARCHITECTURE.md
event_arch = header("Event Architecture", "EVTARCH")
event_arch += section("1. Event System Overview")
event_arch += "EduPilot implements an event-driven architecture using an outbox pattern for reliability.\n\n"
event_arch += section("2. Event Bus Implementation")
event_arch += "| Component | File | Status | Evidence |\n"
event_arch += "|-----------|------|--------|----------|\n"
event_arch += "| EventBus class | lib/events/event-bus.ts | ✅ Active | EDUPILOT_MASTER_FACTS.md |\n"
event_arch += "| EventOutboxRepository | repositories/event-outbox.repository.ts | ✅ Active | EDUPILOT_MASTER_FACTS.md |\n"
event_arch += "| EventWorker | lib/workers/event.worker.ts | ✅ Active | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| Event Types | lib/events/event-types.ts | ✅ Active | 30+ event types |\n"
event_arch += "| Subscribers | lib/subscribers/*.ts | ✅ Active | 5 subscriber files |\n\n"
event_arch += section("3. Event Flow")
event_arch += mermaid("graph LR\n")
event_arch += "    A[Publisher Service] -->|publish| B[EventBus]\n"
event_arch += "    B -->|enqueue| C[EventOutboxRepository]\n"
event_arch += "    C -->|persist| D[Firestore]\n"
event_arch += "    E[EventWorker] -->|poll| C\n"
event_arch += "    E -->|claim| C\n"
event_arch += "    E -->|dispatch| B\n"
event_arch += "    B -->|notify| F[Subscribers]\n"
event_arch += "    F --> G[AuditSubscriber]\n"
event_arch += "    F --> H[NotificationSubscriber]\n"
event_arch += "    F --> I[LifecycleSubscriber]\n"
event_arch += "    F --> J[StaffLifecycleSubscriber]\n"
event_arch += "    F --> K[DashboardSubscriber]\n"
event_arch += "```\n\n"
event_arch += section("4. Publishers (15 services)")
event_arch += "| Service | Events | Evidence |\n"
event_arch += "|---------|--------|----------|\n"
event_arch += "| StudentService | STUDENT_CREATED, UPDATED, DELETED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| StaffService | STAFF_CREATED, UPDATED, DELETED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| AttendanceService | ATTENDANCE_MARKED, UPDATED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| FeesService | FEE_CREATED, FEE_PAID | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| AssignmentService | ASSIGNMENT_POSTED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| HomeworkService | HOMEWORK_POSTED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| ExamService | EXAM_CREATED, PUBLISHED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| MarkService | RESULT_PUBLISHED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| NoticeService | NOTICE_POSTED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| EventService | EVENT_CREATED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| MessageService | MESSAGE_SENT | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| BlogService | BLOG_POSTED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| VideoLectureService | VIDEO_LECTURE_POSTED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| TimetableService | TIMETABLE_UPDATED | EDUPILOT_EVENT_CATALOG.md |\n"
event_arch += "| BusService | ROUTE_UPDATED | EDUPILOT_EVENT_CATALOG.md |\n\n"
write_doc("01-architecture/EVENT_ARCHITECTURE.md", event_arch)

# API_ARCHITECTURE.md
api_arch = header("API Architecture", "APIARCH")
api_arch += section("1. API Design")
api_arch += "| Property | Value | Evidence |\n"
api_arch += "|----------|-------|----------|\n"
api_arch += "| Style | RESTful | EDUPILOT_API_CATALOG.md |\n"
api_arch += "| Base Path | /api/v1 | EDUPILOT_API_CATALOG.md |\n"
api_arch += "| Total Routes | 117 | EDUPILOT_API_CATALOG.md |\n"
api_arch += "| Auth Middleware | withAuth | 98 routes |\n"
api_arch += "| Permission Middleware | withPermission | 76 routes |\n"
api_arch += "| Tenant Middleware | withTenant | 110+ routes |\n"
api_arch += "| Error Handler | withErrorHandler | 117 routes |\n\n"
api_arch += section("2. Route Organization")
api_arch += "```\n"
api_arch += "app/api/v1/\n"
api_arch += "  students/          # Student CRUD\n"
api_arch += "  staff/             # Staff CRUD\n"
api_arch += "  attendance/        # Attendance operations\n"
api_arch += "  fees/              # Fee management\n"
api_arch += "  exams/             # Exam management\n"
api_arch += "  assignments/       # Assignment management\n"
api_arch += "  homework/          # Homework management\n"
api_arch += "  timetable/         # Timetable management\n"
api_arch += "  classes/           # Class management\n"
api_arch += "  subjects/          # Subject management\n"
api_arch += "  marks/             # Marks/grades\n"
api_arch += "  behavior/          # Behavior tracking\n"
api_arch += "  quizzes/           # Quiz management\n"
api_arch += "  books/             # Library books\n"
api_arch += "  buses/             # Transport buses\n"
api_arch += "  leave/             # Leave requests\n"
api_arch += "  syllabus/          # Syllabus management\n"
api_arch += "  video-lectures/    # Video content\n"
api_arch += "  notices/           # Notices\n"
api_arch += "  events/            # Events\n"
api_arch += "  messages/          # Messages\n"
api_arch += "  blogs/             # Blog posts\n"
api_arch += "  dashboard/         # Dashboard data\n"
api_arch += "  analytics/         # Analytics\n"
api_arch += "  ai/                # AI endpoints\n"
api_arch += "  auth/              # Authentication\n"
api_arch += "  admin/             # Admin operations\n"
api_arch += "  stripe/            # Payments\n"
api_arch += "  cron/              # Scheduled jobs\n"
api_arch += "  jobs/              # Background jobs\n"
api_arch += "```\n\n"
write_doc("01-architecture/API_ARCHITECTURE.md", api_arch)

print("Architecture documents batch 5 created")
