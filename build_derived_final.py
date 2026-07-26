#!/usr/bin/env python3
"""Build remaining catalog documents"""
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")

# ============================================
# EDUPILOT_USAGE_INDEX.md
# ============================================
usage_index = """# EduPilot Usage Index

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Track usage counts and consumers for all components

---

## Most Used Services

| Service | Used By | Usage Count |
|---------|---------|-------------|
| StudentService | Student routes, Dashboard, Analytics, Attendance, Fees | 17+ |
| StaffService | Staff routes, Dashboard, Analytics, Attendance | 12+ |
| AttendanceService | Attendance routes, Dashboard | 8+ |
| FeesService | Fees routes, Dashboard | 6+ |
| ParentService | Parent routes, Students | 4+ |
| SubscriptionService | Subscription routes, Workers | 3+ |
| NotificationService | Multiple services | 15+ |
| AuditService | Multiple services | 10+ |

## Most Used Repositories

| Repository | Used By | Usage Count |
|------------|---------|-------------|
| StudentRepository | StudentService, AttendanceService, FeesService | 10+ |
| StaffRepository | StaffService, AttendanceService | 8+ |
| AttendanceRepository | AttendanceService | 4+ |
| FeeRepository | FeesService | 4+ |
| ParentRepository | ParentService | 3+ |

## Most Used Middleware

| Middleware | Applied To | Usage Count |
|------------|------------|-------------|
| withAuth | 98 routes | 98 |
| withPermission | 76 routes | 76 |
| withTenant | 110+ routes | 110+ |
| withErrorHandler | 117 routes | 117 |

## Most Used DTOs

| DTO | Used By | Usage Count |
|-----|---------|-------------|
| CreateStudentDTO | StudentService, Student routes | 5+ |
| UpdateStudentDTO | StudentService, Student routes | 4+ |
| CreateStaffDTO | StaffService, Staff routes | 4+ |
| UpdateStaffDTO | StaffService, Staff routes | 3+ |
| CreateAttendanceDTO | AttendanceService | 3+ |
| CreateFeeDTO | FeesService | 3+ |

## Dead Code Usage

| Component | Usage Count | Status |
|-----------|-------------|--------|
| BaseService | 0 | DEAD IMPLEMENTATION |
| IOCRService | 0 | DEAD IMPLEMENTATION |
| StudentResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| StaffResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| ParentResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| FeeResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| OCRRequestDTO | 2 (self + index) | DEAD IMPLEMENTATION |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_USAGE_INDEX.md").write_text(usage_index)
print("Created EDUPILOT_USAGE_INDEX.md")

# ============================================
# EDUPILOT_MODULE_CATALOG.md
# ============================================
module_catalog = """# EduPilot Module Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete catalog of all business modules

---

## Module: Students

| Component | File | Status |
|-----------|------|--------|
| Service | services/StudentService.ts | ✅ Active |
| Repository | repositories/student.repository.ts | ✅ Active |
| Interface | interfaces/IStudentService.ts | ✅ Active |
| Entity | entities/student.entity.ts | ✅ Active |
| Document | documents/StudentDocument.ts | ✅ Active |
| DTOs | dto/CreateStudentDTO.ts, dto/UpdateStudentDTO.ts | ✅ Active |
| Mapper | lib/mappers/StudentPersistenceMapper.ts | ✅ Active |
| Routes | app/api/v1/students/**/*.ts | ✅ Active |

## Module: Staff

| Component | File | Status |
|-----------|------|--------|
| Service | services/StaffService.ts | ✅ Active |
| Repository | repositories/staff.repository.ts | ✅ Active |
| Interface | interfaces/IStaffService.ts | ✅ Active |
| Entity | entities/staff.entity.ts | ✅ Active |
| Document | documents/StaffDocument.ts | ✅ Active |
| DTOs | dto/CreateStaffDTO.ts, dto/UpdateStaffDTO.ts | ✅ Active |
| Mapper | lib/mappers/StaffPersistenceMapper.ts | ✅ Active |
| Routes | app/api/v1/staff/**/*.ts | ✅ Active |

## Module: Attendance

| Component | File | Status |
|-----------|------|--------|
| Service | services/attendance.service.ts | ✅ Active |
| Repository | repositories/attendance.repository.ts | ✅ Active |
| Interface | interfaces/IAttendanceService.ts | ⚠️ PARTIALLY VERIFIED |
| Entity | entities/attendance.entity.ts | ✅ Active |
| Document | documents/AttendanceDocument.ts | ✅ Active |
| DTOs | dto/CreateAttendanceDTO.ts, dto/UpdateAttendanceDTO.ts | ✅ Active |
| Mapper | MISSING | ❌ MISSING IMPLEMENTATION |
| Routes | app/api/v1/attendance/**/*.ts | ✅ Active |

## Module: Parents

| Component | File | Status |
|-----------|------|--------|
| Service | services/parents.service.ts | ✅ Active |
| Repository | repositories/parent.repository.ts | ✅ Active |
| Interface | interfaces/IParentService.ts | ⚠️ PARTIALLY VERIFIED |
| Entity | entities/parent.entity.ts | ✅ Active |
| Document | MISSING | ❌ MISSING IMPLEMENTATION |
| DTOs | dto/CreateParentDTO.ts, dto/UpdateParentDTO.ts | ✅ Active |
| Mapper | MISSING | ❌ MISSING IMPLEMENTATION |
| Routes | app/api/v1/parents/**/*.ts | ✅ Active |

## Module: Fees

| Component | File | Status |
|-----------|------|--------|
| Service | services/fees.service.ts | ✅ Active |
| Repository | repositories/fee.repository.ts | ✅ Active |
| Interface | interfaces/IFeesService.ts | ⚠️ PARTIALLY VERIFIED |
| Entity | entities/fee.entity.ts | ✅ Active |
| Document | documents/FeeDocument.ts | ✅ Active |
| DTOs | dto/CreateFeeDTO.ts, dto/UpdateFeeDTO.ts | ✅ Active |
| Mapper | MISSING | ❌ MISSING IMPLEMENTATION |
| Routes | app/api/v1/fees/**/*.ts | ✅ Active |

## Module: Dashboard

| Component | File | Status |
|-----------|------|--------|
| Service | services/DashboardService.ts | ✅ Active |
| Repository | repositories/dashboard.repository.ts | ✅ Active |
| Interface | interfaces/IDashboardService.ts | ⚠️ PARTIALLY VERIFIED |
| Entity | N/A (aggregated) | N/A |
| Document | N/A | N/A |
| DTOs | MISSING | ❌ MISSING IMPLEMENTATION |
| Mapper | N/A | N/A |
| Routes | app/api/v1/dashboard/**/*.ts | ✅ Active |

## Module: Analytics

| Component | File | Status |
|-----------|------|--------|
| Service | services/analytics.service.ts | ✅ Active |
| Repository | repositories/analytics.repository.ts | ✅ Active |
| Interface | interfaces/IAnalyticsService.ts | ⚠️ PARTIALLY VERIFIED |
| Entity | N/A (computed) | N/A |
| Document | N/A | N/A |
| DTOs | MISSING | ❌ MISSING IMPLEMENTATION |
| Mapper | N/A | N/A |
| Routes | app/api/v1/analytics/**/*.ts | ✅ Active |

## Module: Academics

| Component | File | Status |
|-----------|------|--------|
| ExamService | services/exam.service.ts | ✅ Active |
| AssignmentService | services/assignment.service.ts | ✅ Active |
| HomeworkService | services/homework.service.ts | ✅ Active |
| MarkService | services/marks.service.ts | ✅ Active |
| SyllabusService | services/syllabus.service.ts | ✅ Active |
| TimetableService | services/timetable.service.ts | ✅ Active |
| SubjectService | services/subject.service.ts | ✅ Active |
| ClassService | services/class.service.ts | ✅ Active |

## Module: Communication

| Component | File | Status |
|-----------|------|--------|
| NoticeService | services/notice.service.ts | ✅ Active |
| EventService | services/event.service.ts | ✅ Active |
| MessageService | services/message.service.ts | ✅ Active |
| BlogService | services/blog.service.ts | ✅ Active |
| VideoLectureService | services/video-lecture.service.ts | ✅ Active |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_MODULE_CATALOG.md").write_text(module_catalog)
print("Created EDUPILOT_MODULE_CATALOG.md")

# ============================================
# EDUPILOT_API_CATALOG.md
# ============================================
api_catalog = """# EduPilot API Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of all API routes

---

## API Route Summary

| Metric | Count |
|--------|-------|
| Total Routes | 117 |
| Routes with withAuth | 98 |
| Routes without auth | 19 |
| Routes with withPermission | 76 |
| Routes with adminDb | 14 |

## Routes Without Authentication

| Route | Method | Notes |
|-------|--------|-------|
| app/api/v1/curriculum/engine/route.ts | POST | No auth middleware |
| app/api/v1/education/rules/route.ts | POST | No auth middleware |
| app/api/v1/auth/logout/route.ts | POST | Public by design |
| app/api/v1/auth/register-user/route.ts | POST | Public by design |
| app/api/v1/auth/me/route.ts | GET | Public by design |
| app/api/v1/auth/parent-login/route.ts | POST | Public by design |
| app/api/v1/auth/login/route.ts | POST | Public by design |
| app/api/v1/auth/session/route.ts | GET | Public by design |
| app/api/v1/super-admin/telemetry/route.ts | GET | Admin only |
| app/api/v1/protected-data/route.ts | GET | Protected by design |
| app/api/v1/users/init/route.ts | POST | Public by design |
| app/api/v1/users/register-school/route.ts | POST | Public by design |
| app/api/v1/jobs/attendance-report/route.ts | POST | Cron job |
| app/api/v1/jobs/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/jobs/events/route.ts | POST | Cron job |
| app/api/v1/cron/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/stripe/webhook/route.ts | POST | Webhook (Stripe) |
| app/api/v1/curriculum/load/route.ts | POST | Unknown |
| app/api/v1/curriculum/preview/route.ts | POST | Unknown |

## Routes Using adminDb

| Route | Method | Reason |
|-------|--------|--------|
| app/api/v1/ledger/route.ts | GET | Direct query |
| app/api/v1/chat/route.ts | GET/POST | Direct query |
| app/api/v1/auth/register-user/route.ts | POST | User creation |
| app/api/v1/auth/parent-login/route.ts | POST | Parent auth |
| app/api/v1/admin/users/role/route.ts | POST | Admin operation |
| app/api/v1/admin/users/route.ts | GET/POST | Admin operation |
| app/api/v1/create-user/route.ts | POST | User creation |
| app/api/v1/users/init/route.ts | POST | Initialization |
| app/api/v1/users/register-school/route.ts | POST | Registration |
| app/api/v1/jobs/attendance-report/route.ts | POST | Job trigger |
| app/api/v1/jobs/fee-reminder/route.ts | POST | Job trigger |
| app/api/v1/jobs/[jobId]/route.ts | GET | Job status |
| app/api/v1/cron/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/stripe/webhook/route.ts | POST | Webhook handler |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_API_CATALOG.md").write_text(api_catalog)
print("Created EDUPILOT_API_CATALOG.md")

print("\nAll derived documents created successfully")
