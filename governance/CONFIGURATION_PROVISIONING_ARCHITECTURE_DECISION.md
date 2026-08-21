# Configuration Provisioning — Architecture Decision

**Date:** 2026-08-12
**Phase:** 1 — Architecture Decision
**Status:** READ-ONLY AUDIT — No source modified

---

## 1. Decision

**Selected architecture: Option D — Hybrid synchronous critical provisioning + event-driven reconciliation.**

Provisioning of Academic Year, Classes, Sections, and Departments occurs synchronously inside `ConfigurationService.saveAndPublishConfiguration()`. A `SCHOOL_SETUP_COMPLETED` event subscriber performs idempotent reconciliation for non-critical entities and on config version bumps.

---

## 2. Evidence Summary

### 2.1 Configuration Source of Truth

- **Location:** `tenants/{tenantId}/settings/config`
- **Writer:** `ConfigurationRepository.publishConfiguration()` (`repositories/configuration.repository.ts:98-121`)
- **Service:** `ConfigurationService.saveAndPublishConfiguration()` (`services/configuration.service.ts:108-205`)
- **Proven fact:** This is the only durable artifact written by the wizard. No operational master data is materialized.

### 2.2 Operational Master-Data Source of Truth

| Entity | Collection | Repository | Current State |
|---|---|---|---|
| Academic Year | `academicYears` | `AcademicYearRepository` | Auto-id; `setCurrent()` available |
| Class | `sections` | `ClassRepository` | Auto-id; `classGrade` + `sectionName` |
| Section | `sections` | `SectionRepository` | Auto-id; `classGrade` + `sectionName` |
| Department | `departments` | `DepartmentRepository` | Auto-id; `name` + `code` |
| Subject | *(none)* | *(none)* | Config-only free-text |
| Staff | `staff` | `StaffRepository` | Auto-id |
| Student | `students` | `StudentRepository` | Auto-id |
| Parent | `parents` | `ParentsRepository` | Auto-id |
| Fee Structure | `fee_structures` | `FeeStructureRepository` | Read-only today |

**Critical structural fact:** `ClassRepository` and `SectionRepository` both target the **same `sections` collection** (`class.repository.ts:20`, `section.repository.ts:19`) with the same shape (`classGrade` + `sectionName`). There is no separate `classes` collection.

### 2.3 Identity Model

- **Config class identity:** `academic.classes[].id` = `cls_<name>` string (e.g. `cls_Grade1`) built at `configuration.service.ts:130-135`.
- **Operational section identity:** Auto-generated Firestore doc ID in `sections` collection. The de-facto natural key is the string pair `(classGrade, sectionName)`.
- **Downstream references:** All downstream modules (Student, Attendance, Marks, Timetable, Staff) link by **string values** (`classGrade`, `section`, `subject`), not by Firestore doc ID.
- **Implication:** Introducing a new numeric/UUID class ID and retrofitting every downstream module would be high-risk and is **not required**. The lowest-risk identity strategy preserves the string-key convention.

### 2.4 Class/Section Relationship

- Single `sections` collection.
- `ClassRepository.getAll()` and `SectionRepository.findAllActive()` query the same collection with identical filters (`tenantId` + `!deleted`).
- The current schema does **not** distinguish "class" and "section" by document shape — both interfaces require `classGrade` and `sectionName`.
- Provisioning must use one canonical schema: every `(classGrade, sectionName)` combination gets one document. If a class has no sections, the document uses `sectionName: ""` or a default.

### 2.5 Academic Year Identity

- Auto-ID in `academicYears` collection.
- `AcademicYearRepository.setCurrent(id, tenantId)` clears other `isCurrent` flags and sets the target.
- `TenantService.initializeAcademicYear()` creates one AY with `isCurrent: true` but is only used by the legacy `register-school` path, not the wizard.

### 2.6 Department Identity

- Auto-ID in `departments` collection.
- Fields: `name`, `code`, `headOfDepartment`, `description`, `tenantId`, `deleted`.

### 2.7 Subject Identity

- **Subjects are configuration-only entities.**
- No standalone `subjects` Firestore collection exists.
- Marks use free-text `subject` field (`types/marks.ts`, `marks.service.ts:27`).
- Creating a standalone Subject entity would require retrofitting Marks, Attendance, Timetable, and Staff — high risk, out of Phase-1 scope.

### 2.8 Tenant Isolation

- `BaseRepository` injects `tenantId` on every `create()` (`base.repository.ts:34`).
- All queries filter by `tenantId`.
- Configuration is stored at `tenants/{tenantId}/settings/config`.
- Any provisioning service must reuse `BaseRepository` to maintain isolation.

### 2.9 Existing Legacy Provisioning Paths

1. **`TenantService.setupSchool()`** (`services/tenant.service.ts:32-55`): persists a `tenant-setup` doc and publishes `SCHOOL_SETUP_COMPLETED`. No classes/sections provisioning.
2. **`TenantService.initializeAcademicYear()`** (`services/tenant.service.ts:57-69`): creates one academic year. Used only by legacy `register-school` route.
3. **`SectionRepository.createMissingStructure()`** (`repositories/section.repository.ts:56-67`): idempotent by `(classGrade::sectionName)` key. **Dead code** — referenced only by its own test.

### 2.10 Existing Event Architecture

- **Event type:** `SCHOOL_SETUP_COMPLETED = "school.setup_completed"` (`lib/events/event-types.ts:54`).
- **Publishers:** `ConfigurationService.saveAndPublishConfiguration()` (`:185-191`), `TenantService.setupSchool()` (`:46`), legacy `register-school` route (`:38`).
- **Subscribers:** Only `lib/subscribers/lifecycle.subscriber.ts:44-54` — performs `invalidateCache()` + `logger.info()`. **No provisioning.**
- **Workers:** `lib/workers/event.worker.ts` and `lib/workers/report.worker.tsx` contain no `SCHOOL_SETUP_COMPLETED` handling.
- **Event bus:** In-process `EventBus` with idempotency key check (`event-bus.ts:100-106`). QStash/worker infrastructure exists but has a known double-read defect (F-03).

### 2.11 Existing Provisioning Helpers

- **`SectionRepository.createMissingStructure()`**: Idempotent by `(classGrade::sectionName)` key. Creates only missing section docs. **Currently dead code.**

### 2.12 Existing Downstream References

All downstream modules use string keys, not Firestore doc IDs:

- **Student:** `classGrade`, `section` strings (`StudentPersistenceMapper.ts:62-63`)
- **Attendance:** `classGrade`, `section`, `studentId` strings (`attendance.service.ts:36,54,100`)
- **Marks:** `classGrade`, `section`, `term`, `subject`, `studentId` strings
- **Fees:** `studentId` only (`FeeDocument.ts:3`)
- **Timetable:** `classGrade`, `subject`, `teacher` strings (`types/timetable.ts:3-10`)
- **Staff:** `subjects[]`, `classesAssigned[]`, `sectionAssignment[]` strings (`StaffDocument.ts:41-45`)
- **Parents:** `studentIds[]` (`ParentDocument.ts:4`)

---

## 3. Explicit Resolutions

### Q1 — Are Subjects configuration-only or operational entities?

**Subjects remain configuration-only free-text strings.**

No standalone `subjects` Firestore collection exists. Marks, Attendance, Timetable, and Staff all reference subjects by free-text string. Creating a standalone Subject entity would require retrofitting all downstream modules — a high-risk change with no proven benefit for Phase 1.

### Q2 — What is the canonical Section document shape?

**Canonical shape:** `{ classGrade: string, sectionName: string, tenantId: string, deleted: boolean, createdBy?: string, subjects?: { core: string[]; electives: string[] } }`.

Both `ClassRepository` and `SectionRepository` write to the `sections` collection. Provisioning uses one canonical shape. Every `(classGrade, sectionName)` combination from the wizard gets one document. If a class has no sections, `sectionName` defaults to `""` or a configurable default.

### Q3 — What is the Phase-1 provisioning scope?

**Phase-1 scope: Academic Year, Classes, Sections, Departments.**

- **Academic Year:** Create-if-absent for the tenant, set `isCurrent: true`, write id back to `config.metadata.academicYearId`.
- **Classes/Sections:** Materialize every `(classGrade, sectionName)` combination from `config.academic.classes` × `config.academic.sectionNames` into the `sections` collection.
- **Departments:** Upsert `config.academic.departments` by name into `departments` collection.
- **Deferred:** Fee structures (repo is read-only), Staff/Teachers (informational `requiredTeachers` only), Subjects (config-only), Rooms/Buildings/Facilities/Library/Transport/Hostel/Houses/Shifts/Grading.

### Q4 — Which existing IDs/references must remain stable?

- **Firestore auto-generated IDs** for existing operational documents must not change.
- **String keys** (`classGrade`, `sectionName`, `subject`) used by downstream modules must be preserved exactly.
- **Config document ID** `current` and its schema must remain stable.
- **Event payload shape** for `SCHOOL_SETUP_COMPLETED` must remain stable (backward compatibility for existing subscriber).

### Q5 — Is Hybrid provisioning the final architecture?

**Yes. Hybrid (Option D) is the final architecture.**

- **Synchronous critical path:** `saveAndPublishConfiguration()` calls `ConfigurationProvisioningService.provisionFromConfiguration()` before/after `publishConfiguration`. This ensures Academic Year and Sections exist immediately for Dashboard, Timetable, and Attendance grouping.
- **Asynchronous reconciliation:** A `SCHOOL_SETUP_COMPLETED` subscriber (replacing the no-op logger) triggers idempotent re-sync for Departments, fee structures, teacher reconciliation, and config version bumps.
- **Rationale:** Critical data availability immediately after wizard save + decoupled non-critical/large/re-sync work. Resilient to current QStash defect (F-03) because critical path stays in-process.

---

## 4. Architecture Selection

### Option A — Dashboard reads configuration directly
**Rejected.** Fixes the display symptom for classes/sections/subjects only. Teachers/Students/Parents are real operational counts and cannot come from config. Does not solve the underlying provisioning problem (timetable, attendance grouping, AY linkage remain broken).

### Option B — Wizard provisions operational master data (synchronous only)
**Rejected as sole mechanism.** Correctness is high, but couples the wizard to all operational writes. Non-critical entities (departments, fee structures) and re-sync on version bumps would block the wizard response or be omitted.

### Option C — Fully event-driven provisioning
**Rejected as sole mechanism.** Requires QStash/worker reliability (F-03 currently broken). If the worker never runs, no provisioning happens. Dashboard and downstream workflows remain broken until the event is eventually processed.

### Option D — Hybrid synchronous critical provisioning + event-driven reconciliation
**Selected.** Immediate correctness for critical entities (AY, sections) via synchronous provisioning. Event-driven reconciliation for non-critical entities and version bumps. Lowest migration risk, additive-only, tenant-safe, resilient to F-03.

---

## 5. Identity Model

### 5.1 Deterministic Keys

All provisioning writes use **deterministic natural keys** for idempotency:

| Entity | Deterministic Key | Firestore Doc ID (optional) |
|---|---|---|
| Academic Year | `tenantId` + `name` | Auto-id (lookup by name) |
| Section | `tenantId` + `classGrade` + `sectionName` | Deterministic: `${tenantId}__${classGrade}__${sectionName}` |
| Department | `tenantId` + `name` | Auto-id (lookup by name) |

### 5.2 Why Not Auto-ID Exclusively?

Auto-generated IDs make "create-if-absent" require a read-before-write query. Deterministic doc IDs make writes idempotent by construction (`set` with `{ merge: true }`). For sections specifically, deterministic IDs like `sections/{tenantId}__{classGrade}__{sectionName}` eliminate duplicates on retry/event replay without a lookup.

### 5.3 Existing Auto-ID Compatibility

If existing auto-ID records exist, provisioning must:
1. Query by natural key first.
2. If found, skip creation (idempotent).
3. If not found, create with either deterministic ID or auto-ID and record the mapping.

No destructive migration is performed.

---

## 6. Collection Model

### 6.1 Existing Collections (Preserved)

| Collection | Purpose | Notes |
|---|---|---|
| `academicYears` | Academic year records | Auto-id, `isCurrent` flag |
| `sections` | Classes and sections | Shared by `ClassRepository` and `SectionRepository` |
| `departments` | Department records | Auto-id |
| `students` | Student records | Unchanged |
| `staff` | Staff records | Unchanged |
| `parents` | Parent records | Unchanged |
| `fee_structures` | Fee templates | Read-only in current code |
| `tenants/{tenantId}/settings/config` | Configuration blueprint | Single doc |

### 6.2 No New Collections

No new Firestore collections are created in Phase 1. No `classes` collection is created. The existing `sections` collection is the sole target for class/section provisioning.

---

## 7. Provisioning Boundary

### 7.1 In Scope (Phase 1)

1. **Academic Year:** Create active AY if absent; set `isCurrent: true`; update `config.metadata.academicYearId`.
2. **Classes/Sections:** For every `classGrade` × `sectionName` combination, ensure a `sections` document exists.
3. **Departments:** For every department name in config, ensure a `departments` document exists.

### 7.2 Out of Scope (Phase 1)

- Fee structures (repository is read-only; deferred)
- Staff/teacher seeding (`requiredTeachers` is informational only)
- Subject catalog (config-only free-text)
- Rooms, buildings, facilities, library, transport, hostel, houses, shifts, grading
- Student, parent, attendance, marks, results, timetable provisioning

---

## 8. Transaction Boundary

### 8.1 Synchronous Path

```
saveAndPublishConfiguration()
  ├─ validate input
  ├─ publishConfiguration() → Firestore: tenants/{tid}/settings/config
  ├─ provisionFromConfiguration(tid, config, userId)
  │    ├─ createIfAbsent academic year
  │    ├─ createMissing sections (batched)
  │    └─ upsert departments (batched)
  ├─ update config.metadata.academicYearId (merge)
  ├─ invalidate cache
  └─ eventBus.publish(SCHOOL_SETUP_COMPLETED)
```

**Boundary:** The wizard publish + critical provisioning is synchronous. If any critical provisioning step fails, the error propagates to the client. The config document may already be written — this is acceptable because:
- Provisioning is idempotent (re-running the same wizard save produces the same operational state).
- No existing operational records are deleted or modified.

### 8.2 Asynchronous Path

```
SCHOOL_SETUP_COMPLETED event
  └─ lifecycle subscriber (or new provisioning subscriber)
       └─ reconcile non-critical entities
            ├─ re-sync departments
            ├─ re-sync fee structures (when write path exists)
            └─ re-sync teacher requirements (informational)
```

**Boundary:** Event-driven reconciliation runs after the wizard response. Failures are logged but do not fail the wizard.

---

## 9. Event Boundary

### 9.1 Existing Event

`SCHOOL_SETUP_COMPLETED` continues to be published by both `ConfigurationService` and `TenantService`.

### 9.2 Subscriber Change

The existing `lifecycle.subscriber.ts:44-54` no-op logger body is replaced with a real provisioning reconciliation call. The `invalidateCache()` call is preserved.

### 9.3 Event Reliability

- In-process `EventBus` dispatch is synchronous and reliable.
- Worker-based dispatch (QStash) depends on F-03 fix. Critical provisioning does not depend on it.

---

## 10. Rollback Strategy

### 10.1 Additive-Only Guarantee

Provisioning writes are **always additive** (create-if-absent, no deletes). A bad provisioning version can be fixed forward by re-running `provisionFromConfiguration()` — it only adds missing records.

### 10.2 Config Rollback

If the configuration is rolled back via `version.engine`, provisioning should record `lastProvisionedVersion` in `config.metadata` and skip/merge on downgrade. Additive policy means downgrade does not delete operational data.

### 10.3 Code Rollback

Each phase change is additive:
- Revert the single service method or subscriber.
- No Firestore schema changes.
- No document migrations.

---

## 11. Unresolved Questions

| # | Question | Resolution | Owner |
|---|---|---|---|
| U1 | Fee structure write path is read-only today. Should Phase 1 add write capability, or defer? | **Defer.** Fee structures are not required for Dashboard/AY/Class/Section/Department verification. |
| U2 | Should `ClassRepository.getAll()` semantics change to return distinct `classGrade` values for the dashboard? | **Separate decision.** Governed by `FINDING_03_CLASS_SECTION_GOVERNANCE.md`. Not part of provisioning. |
| U3 | Should `sectionName` default to `""` or `"A"` when a class has no explicit sections? | **Defer to Phase 2 design.** Current `createMissingStructure` uses explicit section names from config. |
| U4 | QStash F-03 fix timeline? | **Out of scope.** Critical path is synchronous; async reconciliation works without QStash. |
| U5 | Should `config.metadata.academicYearId` be updated synchronously in the same write as `publishConfiguration`, or in a separate merge? | **Separate merge.** Updating `academicYearId` requires the AY to exist first, so it must happen after AY creation. A single `saveConfiguration` merge after provisioning is sufficient. |

---

## 12. Architecture Compliance Matrix

| Requirement | Status | Mechanism |
|---|---|---|
| Route → Service → Repository → Firestore | **Preserved** | `ConfigurationService` → `ConfigurationProvisioningService` → existing repositories |
| Tenant isolation | **Preserved** | All writes through `BaseRepository` (auto-injects `tenantId`) |
| Stable identities | **Preserved** | Deterministic natural keys; no destructive ID changes |
| Idempotency | **Guaranteed** | Create-if-absent + deterministic keys; no `deleteAllForTenant` |
| Backward compatibility | **Preserved** | Event payload unchanged; string-key FKs unchanged |
| Existing downstream relationships | **Preserved** | No changes to Student, Attendance, Marks, Fees, Timetable |
| Auditability | **Preserved** | Config version number + checksum track provisioning versions |
| Rollback safety | **Guaranteed** | Additive-only writes; no deletes; fix-forward by re-run |

---

## 13. Files Inspected (Representative)

- `services/configuration.service.ts`
- `repositories/configuration.repository.ts`
- `repositories/class.repository.ts`
- `repositories/section.repository.ts`
- `repositories/academic-year.repository.ts`
- `repositories/department.repository.ts`
- `repositories/student.repository.ts`
- `repositories/staff.repository.ts`
- `repositories/parents.repository.ts`
- `repositories/fee-structure.repository.ts`
- `repositories/base.repository.ts`
- `services/tenant.service.ts`
- `services/configuration-dashboard.service.ts`
- `lib/events/event-types.ts`
- `lib/events/event-bus.ts`
- `lib/subscribers/lifecycle.subscriber.ts`
- `types/configuration/core.ts`
- `types/configuration/wizard.ts`
- `interfaces/IClassRepository.ts`
- `interfaces/ISectionRepository.ts`
- `interfaces/IAcademicYearRepository.ts`
- `interfaces/IDepartmentRepository.ts`
- `interfaces/IConfigurationService.ts`
- `interfaces/IFeeStructureRepository.ts`
- `lib/mappers/StudentPersistenceMapper.ts`
- `documents/StaffDocument.ts`
- `documents/DepartmentDocument.ts`
- `app/api/v1/settings/school-configuration/route.ts`
- `app/api/v1/configuration/dashboard/route.ts`
- `app/(protected)/admin/school-setup/components/SmartConfigurationWizard.tsx`
- `hooks/useConfigurationDashboard.ts`
- `__tests__/services/configuration.service.test.ts`
- `repositories/section.repository.test.ts`
- Governance: `CONFIGURATION_PROVISIONING_ARCHITECTURE_AUDIT.md`, `CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md`, `ADR001_IMPLEMENTATION_PLAN.md`

---

*End of Phase 1 Architecture Decision. No source code modified.*
