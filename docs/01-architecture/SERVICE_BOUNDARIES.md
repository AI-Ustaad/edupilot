# Service Boundaries

**Document ID**: EDU-SB-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Service Layer Definition

The service layer contains all business logic. Services must not directly access Firestore or call repositories from other services.

## 2. Service Contracts

| Service | Interface | Parameters | Returns | Evidence |
| --- | --- | --- | --- | --- |
| StudentService | IStudentService | (tenantId, id, data, userId) | StudentResponseDTO | EDUPILOT_MASTER_FACTS.md |
| StaffService | IStaffService | (tenantId, id, data, userId) | StaffResponseDTO | EDUPILOT_MASTER_FACTS.md |
| AttendanceService | IAttendanceService | (tenantId, id, data, userId) | AttendanceResponseDTO | EDUPILOT_MASTER_FACTS.md |
| FeesService | IFeesService | (tenantId, id, data, userId) | FeeResponseDTO | EDUPILOT_MASTER_FACTS.md |
| ParentService | IParentService | (tenantId, id, data, userId) | ParentResponseDTO | EDUPILOT_MASTER_FACTS.md |

## 3. Violations

| Service | Violation | Evidence |
|---------|-----------|----------|
| SubscriptionService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |
| FeatureFlagService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |
| JobService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |
| TelemetryService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |
| AnalyticsService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |
| AuditService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |
