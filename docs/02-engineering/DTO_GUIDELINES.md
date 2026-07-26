# DTO Guidelines

**Document ID**: EDU-DTO-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. DTO Pattern

All input/output must use DTOs. No raw objects in service interfaces.

## 2. DTO Structure

| Type | Naming | Purpose | Example |
| --- | --- | --- | --- |
| Create | Create{Domain}DTO | Input for creation | CreateStudentDTO |
| Update | Update{Domain}DTO | Input for update | UpdateStudentDTO |
| Response | {Domain}ResponseDTO | Output for client | StudentResponseDTO |

## 3. Validation

- DTOs must embed Zod validation schemas
- Validation occurs at route entry
- No validation in services or repositories

