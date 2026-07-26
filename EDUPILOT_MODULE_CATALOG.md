# EduPilot Module Catalog

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
