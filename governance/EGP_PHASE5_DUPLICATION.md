# EduPilot Enterprise Governance Program (EGP)
## Phase 5 — Duplication Detection
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 5: DUPLICATION DETECTION

### Methodology
Search entire repository for:
- Business Logic Duplication
- Repository Duplication
- Service Duplication
- Validation Duplication
- DTO Duplication
- Mapper Duplication
- Utility Duplication
- Configuration Duplication

---

### Finding 1: Validation Schema Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Validation Duplication |
| **Current Location** | `dto/CreateStudentDTO.ts` defines `CreateStudentSchema` (Zod schema). `services/StudentService.ts` imports and uses `CreateStudentSchema` for validation. `validators/` directory also contains validation schemas. |
| **Duplicate Location** | `services/StaffService.ts` uses `CreateStaffSchema` from `@/dto`. `services/AttendanceService.ts` uses `MarkAttendanceSchema` from `@/validators/attendance`. `services/AssignmentService.ts` uses `CreateAssignmentSchema` from `@/validators/teacher`. |
| **Analysis** | Validation schemas are defined in two locations: `dto/` directory and `validators/` directory. The `dto/` directory contains Zod schemas for DTOs (e.g., `CreateStudentDTO.ts` has `CreateStudentSchema`). The `validators/` directory contains separate validation schemas (e.g., `validators/attendance.ts` has `MarkAttendanceSchema`). This creates a dual-source-of-truth problem where the same validation logic may exist in both locations. |
| **Recommended Owner** | Consolidate all validation schemas into a single `validators/` directory. DTOs should be pure data types; validation schemas should live in `validators/`. |

---

### Finding 2: Audit Logging Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Business Logic Duplication |
| **Current Location** | `services/StaffService.ts` lines 92-99, 143-150, 164-171, 222-229, 275-282, 317-324, 351-358, 372-378, 390-396, 408-414, 420-426 — 11 separate audit log calls, each with identical structure (`action`, `userId`, `tenantId`, `entityId`, `entityType`, `metadata`). |
| **Duplicate Location** | `services/AttendanceService.ts` lines 48-55, 83-89, 141-148, 167-174 — 4 audit log calls with identical structure. `services/fees.service.ts` lines 42-49, 125-132, 152-159 — 3 audit log calls with identical structure. `services/assignment.service.ts` lines 39-46, 73-80, 93-99, 127-133 — 4 audit log calls. |
| **Analysis** | The audit logging pattern is duplicated across 4+ services. Each service creates an `AuditService` instance and calls `this.audit.log({...})` with the same structure. This is not a true duplication (each call has different action/metadata), but the `AuditService` instantiation pattern is duplicated — every service creates its own `AuditService` instance instead of receiving it via DI. |
| **Recommended Owner** | `AuditService` should be a singleton or injected via DI. The audit logging pattern itself is not duplicated (each call has unique data), but the instantiation pattern is. |

---

### Finding 3: Event Bus Publishing Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Business Logic Duplication |
| **Current Location** | `services/StudentService.ts` lines 44-54, 73-77, 99-103, 109-113 — 4 event publishes. `services/StaffService.ts` lines 101-106, 108-115, 152-157, 173-178, 231-235, 284-290, 360-366, 380-384, 398-402 — 9 event publishes. `services/attendance.service.ts` lines 57-63, 91-95, 151-155, 177-181 — 4 event publishes. `services/fees.service.ts` lines 52-59, 135-140, 163-168 — 3 event publishes. |
| **Duplicate Location** | Every service that performs CRUD operations publishes events with identical structure (`tenantId`, `entityId`, `tenantId`, payload). The event publishing pattern is identical across all services. |
| **Analysis** | The event publishing pattern is duplicated across all services. Each service imports `eventBus` and `EVENTS` and calls `eventBus.publish(eventType, payload, tenantId)` with the same structure. This is a cross-cutting concern that could be abstracted into a base service or middleware. |
| **Recommended Owner** | Consider an `EventPublishingMixin` or base service class that provides `publishEvent()` method. However, this is a design choice, not a true duplication — each service publishes different event types with different payloads. |

---

### Finding 4: Repository Instantiation Pattern Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Service Duplication |
| **Current Location** | `services/StudentService.ts` line 21: `this.repository = repository ?? new StudentRepository()`. `services/StaffService.ts` line 33: `this.repository = repository ?? new StaffRepository()`. `services/AttendanceService.ts` line 24: `this.repository = repository ?? new AttendanceRepository()`. `services/fees.service.ts` line 23: `this.repository = repository ?? new FeesRepository()`. `services/assignment.service.ts` line 19: `this.repo = repo ?? new AssignmentRepository()`. `services/ValidationService.ts` — no repository. `services/AuditService.ts` line 19: `this.auditRepo = auditRepo ?? new AuditRepository()`. |
| **Duplicate Location** | Every service that uses a repository follows the same pattern: `constructor(repository?: IRepository) { this.repository = repository ?? new ConcreteRepository() }`. This pattern is duplicated across 15+ services. |
| **Analysis** | The repository instantiation fallback pattern is duplicated. While each service uses a different repository, the pattern itself is identical. This is a code smell that could be addressed with a DI container or factory pattern. |
| **Recommended Owner** | Consider a DI container or service factory that handles repository instantiation. The pattern itself is not harmful but is verbose. |

---

### Finding 5: DTO Duplication

| Attribute | Evidence |
|---|---|
| **Type** | DTO Duplication |
| **Current Location** | `dto/CreateStudentDTO.ts` defines `CreateStudentDTO` with fields: `firstName`, `lastName`, `email`, `classGrade`, `section`, `parentId`, `rollNumber`, `status`, `admissionDate`, `gender`, `dateOfBirth`, `bloodGroup`, `address`, `emergencyContact`, `medicalInfo`, `metadata`. |
| **Duplicate Location** | `types/student.ts` may define overlapping types. The `StudentPersistenceMapper` maps between DTOs and Firestore documents, and the `StudentEntity` type in `entities/student.entity.ts` may have overlapping fields. |
| **Analysis** | DTOs are defined in the `dto/` directory. Entities are defined in the `entities/` directory. Types are defined in the `types/` directory. There is potential overlap between DTO fields and entity fields, but they serve different purposes (DTOs for API input, entities for domain model, types for type aliases). No true duplication found. |
| **Recommended Owner** | No action needed — DTOs, entities, and types serve distinct purposes. |

---

### Finding 6: Mapper Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Mapper Duplication |
| **Current Location** | `lib/mappers/StudentPersistenceMapper.ts` — maps between DTO, entity, and Firestore document. `lib/mappers/StaffPersistenceMapper.ts` — same pattern. `lib/mappers/AttendancePersistenceMapper.ts` — same pattern. `lib/mappers/FeePersistenceMapper.ts` — same pattern. `lib/mappers/ParentPersistenceMapper.ts` — same pattern. |
| **Duplicate Location** | Each persistence mapper follows the same pattern: `fromDTO()`, `toFirestore()`, `fromFirestore()`. The structure is identical across all mappers. |
| **Analysis** | The mapper pattern is duplicated across 5+ mappers. Each mapper has the same three methods with the same structure but different field mappings. This is a template pattern that could be abstracted into a base mapper class. |
| **Recommended Owner** | Consider a `BasePersistenceMapper` abstract class with common logic (ID generation, date handling, tenant ID injection). Each concrete mapper would extend it and provide field-specific mappings. |

---

### Finding 7: Cache Invalidation Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Business Logic Duplication |
| **Current Location** | `services/AttendanceService.ts` lines 46, 81, 138, 164 — 4 calls to `invalidateCache(\`dashboard:${tenantId}\`)`. `services/fees.service.ts` lines 38-39, 121-122, 149-150 — 3 calls. `services/assignment.service.ts` lines 38, 71, 92 — 3 calls. |
| **Duplicate Location** | Every service that modifies data invalidates the dashboard cache with the same key pattern. |
| **Analysis** | The cache invalidation pattern is duplicated across services. Each service calls `invalidateCache(\`dashboard:${tenantId}\`)` after creating/updating/deleting records. This is a cross-cutting concern that could be handled by the event bus or a middleware. |
| **Recommended Owner** | Consider a cache invalidation middleware or event subscriber that automatically invalidates the dashboard cache when relevant events are published. |

---

### Finding 8: Error Handling Pattern Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Business Logic Duplication |
| **Current Location** | `services/StaffService.ts` uses `NotFoundException`, `BusinessError`, `ValidationError`, `SubscriptionLimitException` from `@/errors/AppError`. `services/AttendanceService.ts` uses `NotFoundException` from `@/errors/AppError` and raw `Error` throws. `services/fees.service.ts` uses raw `Error` throws. `services/StudentService.ts` uses `BusinessError` from `@/errors`. |
| **Duplicate Location** | Error handling is inconsistent across services. Some use custom error classes, others use raw `Error`. Some throw `NotFoundException`, others return `null`. |
| **Analysis** | There is no consistent error handling pattern across services. This is not a true duplication but an inconsistency that should be addressed. |
| **Recommended Owner** | Standardize error handling across all services. Use custom error classes consistently. |

---

### Finding 9: Configuration Dashboard Repository Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Repository Duplication |
| **Current Location** | `services/configuration-dashboard.service.ts` lines 272-280 instantiates 7 repositories in the singleton export. `app/api/v1/configuration/dashboard/route.ts` (pre-refactor) also instantiated 7 repositories directly. |
| **Duplicate Location** | The pre-refactor route instantiated the same 7 repositories. The post-refactor service instantiates them once as a singleton. |
| **Analysis** | The singleton export of `configurationDashboardService` creates all 7 repositories at module load time. This is acceptable for a singleton but means the repositories are never garbage collected. |
| **Recommended Owner** | Acceptable for singleton pattern. Consider lazy initialization for rarely-used repositories. |

---

### Finding 10: Tenant ID Derivation Duplication

| Attribute | Evidence |
|---|---|
| **Type** | Utility Duplication |
| **Current Location** | `services/tenant.service.ts` line 34: `const tenantId = userId.startsWith("tenant_") ? userId : \`tenant_${userId}\``. `services/tenant.resolver.ts` lines 72-83: `deriveTenantId()` method with similar logic. |
| **Duplicate Location** | Both `TenantService` and `TenantResolver` contain tenant ID derivation logic. |
| **Analysis** | The tenant ID derivation logic is duplicated between `TenantService.setupSchool()` and `TenantResolver.deriveTenantId()`. The resolver has more sophisticated logic (hashing email), but the basic prefix check is duplicated. |
| **Recommended Owner** | Extract tenant ID derivation into a shared utility function in `lib/tenant-utils.ts` (which already exists). Both services should use the shared utility. |

---

### PHASE 5 SUMMARY

| Duplication Type | Count | Severity | Recommended Action |
|---|---|---|---|
| Validation Schema Duplication | 1 | MEDIUM | Consolidate into validators/ directory |
| Audit Logging Pattern Duplication | 1 | LOW | Make AuditService a singleton |
| Event Publishing Pattern Duplication | 1 | LOW | Consider base service or mixin |
| Repository Instantiation Pattern | 1 | LOW | Consider DI container |
| DTO Duplication | 0 | NONE | No action needed |
| Mapper Pattern Duplication | 1 | LOW | Consider base mapper class |
| Cache Invalidation Pattern | 1 | LOW | Consider event subscriber |
| Error Handling Inconsistency | 1 | MEDIUM | Standardize error handling |
| Configuration Dashboard Repos | 1 | LOW | Acceptable for singleton |
| Tenant ID Derivation | 1 | MEDIUM | Extract to shared utility |

