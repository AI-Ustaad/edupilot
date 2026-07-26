# API Architecture

**Document ID**: EDU-APIARCH-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. API Design

| Property | Value | Evidence |
|----------|-------|----------|
| Style | RESTful | EDUPILOT_API_CATALOG.md |
| Base Path | /api/v1 | EDUPILOT_API_CATALOG.md |
| Total Routes | 117 | EDUPILOT_API_CATALOG.md |
| Auth Middleware | withAuth | 98 routes |
| Permission Middleware | withPermission | 76 routes |
| Tenant Middleware | withTenant | 110+ routes |
| Error Handler | withErrorHandler | 117 routes |

## 2. Route Organization

```
app/api/v1/
  students/          # Student CRUD
  staff/             # Staff CRUD
  attendance/        # Attendance operations
  fees/              # Fee management
  exams/             # Exam management
  assignments/       # Assignment management
  homework/          # Homework management
  timetable/         # Timetable management
  classes/           # Class management
  subjects/          # Subject management
  marks/             # Marks/grades
  behavior/          # Behavior tracking
  quizzes/           # Quiz management
  books/             # Library books
  buses/             # Transport buses
  leave/             # Leave requests
  syllabus/          # Syllabus management
  video-lectures/    # Video content
  notices/           # Notices
  events/            # Events
  messages/          # Messages
  blogs/             # Blog posts
  dashboard/         # Dashboard data
  analytics/         # Analytics
  ai/                # AI endpoints
  auth/              # Authentication
  admin/             # Admin operations
  stripe/            # Payments
  cron/              # Scheduled jobs
  jobs/              # Background jobs
```

