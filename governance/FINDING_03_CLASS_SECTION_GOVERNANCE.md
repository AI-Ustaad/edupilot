# Finding #3 — Class / Section Repository Boundary

## 1. Executive Summary

The Enterprise Architecture Governance Board (EAGB) has completed a read-only review of the ClassRepository and SectionRepository architecture. The review examines whether the current design violates intended enterprise architecture boundaries.

**Key Finding:** ClassRepository and SectionRepository exhibit significant responsibility overlap. Both target the identical Firestore collection (`sections`) with substantially overlapping document schemas. The current domain model does not distinguish "Class" and "Section" as separate persistence entities. Instead, both repositories operate on the same flat section documents.

**Governance Decision:** `APPROVE — REFACTOR`

**Rationale:** The current architecture is not a clean shared-persistence design. It is an accidental duplication of repository abstraction over a single persistence entity. The boundaries between Class and Section responsibilities are ambiguous, and multiple runtime consumers depend on this ambiguity.

---

## 2. Evidence Reviewed

| Source | Path | Role |
|--------|------|------|
| Class Repository | `/Users/imranhaidersandhu/Documents/edupilot/repositories/class.repository.ts` | ClassRepository implementation |
| Section Repository | `/Users/imranhaidersandhu/Documents/edupilot/repositories/section.repository.ts` | SectionRepository implementation |
| Base Repository | `/Users/imranhaidersandhu/Documents/edupilot/repositories/base.repository.ts` | Inherited CRUD operations |
| Class Service | `/Users/imranhaidersandhu/Documents/edupilot/services/class.service.ts` | Service-layer consumer |
| Configuration Dashboard Service | `/Users/imranhaidersandhu/Documents/edupilot/services/configuration-dashboard.service.ts` | Runtime consumer of both repos |
| Tenant Service | `/Users/imranhaidersandhu/Documents/edupilot/services/tenant.service.ts` | Imports SectionRepository (unused) |
| API Route | `/Users/imranhaidersandhu/Documents/edupilot/app/api/v1/classes/route.ts` | Route consumer |
| Tenant Setup Repository | `/Users/imranhaidersandhu/Documents/edupilot/repositories/tenant-setup.repository.ts` | Direct collection writer |
| Class Repository Test | `/Users/imranhaidersandhu/Documents/edupilot/repositories/class.repository.test.ts` | Test evidence |
| Section Repository Test | `/Users/imranhaidersandhu/Documents/edupilot/repositories/section.repository.test.ts` | Test evidence |
| IClassRepository | `/Users/imranhaidersandhu/Documents/edupilot/interfaces/IClassRepository.ts` | Interface contract |
| ISectionRepository | `/Users/imranhaidersandhu/Documents/edupilot/interfaces/ISectionRepository.ts` | Interface contract |
| IClassService | `/Users/imranhaidersandhu/Documents/edupilot/interfaces/IClassService.ts` | Service interface |

---

## 3. Current Architecture

```
                    API Route (/api/v1/classes)
                           │
              ┌────────────┴────────────┐
              │                         │
        ClassService             SectionRepository (direct)
              │                         │
        ClassRepository           SectionRepository
              │                         │
              └────────────┬────────────┘
                           │
                    Firestore "sections"
                           │
                 TenantSetupRepository (direct writer)
```

### Collection Evidence

| Repository | Collection | Constructor Evidence |
|------------|-----------|---------------------|
| ClassRepository | `"sections"` | `super("sections")` |
| SectionRepository | `"sections"` | `super("sections")` |

### Document Schema Evidence

**ClassRepository** defines `ClassRecord`:
```typescript
export interface ClassRecord {
  classGrade: string;
  sectionName: string;
  incharge?: string;
  subjects?: { core: string[]; electives: string[] };
  createdBy?: string;
  tenantId: string;
  deleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
}
```

**SectionRepository** defines `Section`:
```typescript
export interface Section {
  classGrade: string;
  sectionName: string;
  incharge?: string;
  subjects?: { core: string[]; electives: string[] };
  tenantId: string;
  deleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  createdBy?: string;
}
```

**Overlap:** `classGrade`, `sectionName`, `incharge`, `subjects`, `tenantId`, `deleted`, `createdBy` are present in both schemas. The only additions are `deletedAt`/`deletedBy` on `Section` and `createdAt`/`updatedAt` on `ClassRecord` (added by BaseRepository).

---

## 4. Domain Boundary Analysis

### 4.1 ClassRepository Domain Responsibility

| Dimension | Evidence |
|-----------|----------|
| Domain entity | `ClassRecord` — claims to represent a "Class" |
| Persistence entity | Document in `sections` collection |
| Collection | `sections` |
| Document structure | `classGrade` + `sectionName` + optional metadata |
| Tenant boundary | `.where("tenantId", "==", tenantId)` |
| CRUD responsibilities | `createClass`, `deleteClass`, plus inherited `create`, `update`, `delete`, `findById`, `findAll`, `paginate`, `count`, `exists`, `bulkCreate` |
| Query responsibilities | `getAll` — returns all non-deleted documents for tenant |
| Mutation responsibilities | `createClass` (wraps `BaseRepository.create`), `deleteClass` (soft-delete via `update`) |
| Soft-delete behavior | Sets `deleted: true` and `deletedAt: dbTimestamp` |
| Special business operations | None beyond inherited |
| Runtime consumers | `ClassService`, `ConfigurationDashboardService` |
| Service consumer | `ClassService` |

### 4.2 SectionRepository Domain Responsibility

| Dimension | Evidence |
|-----------|----------|
| Domain entity | `Section` — claims to represent a "Section" |
| Persistence entity | Document in `sections` collection |
| Collection | `sections` |
| Document structure | Identical core fields to `ClassRecord` |
| Tenant boundary | `.where("tenantId", "==", tenantId)` |
| CRUD responsibilities | `findAllActive`, `softDeleteBySectionId`, `deleteAllForTenant`, `createMissingStructure`, plus inherited `create`, `update`, `delete`, `findById`, `findAll`, `paginate`, `count`, `exists`, `bulkCreate` |
| Query responsibilities | `findAllActive` — returns non-deleted documents for tenant |
| Mutation responsibilities | `softDeleteBySectionId` (direct doc update with `deletedBy`), `deleteAllForTenant` (batch hard-delete) |
| Soft-delete behavior | Sets `deleted: true`, `deletedAt`, `deletedBy`, `updatedAt` |
| Special business operations | `createMissingStructure` (idempotent section creation), `deleteAllForTenant` (bulk hard-delete) |
| Runtime consumers | `ConfigurationDashboardService`, `TenantService` (imported but unused in current code), `app/api/v1/classes/route.ts` |
| Service consumer | None — no dedicated `SectionService` exists |

### 4.3 Responsibility Comparison

| Dimension | ClassRepository | SectionRepository |
|-----------|-----------------|-------------------|
| Domain responsibility | Ambiguous — claims Class but stores section-level data | Clear — represents Section |
| Firestore collection | `sections` | `sections` |
| Document schema | `classGrade`, `sectionName`, `subjects`, `tenantId`, `deleted`, `createdBy` | `classGrade`, `sectionName`, `subjects`, `tenantId`, `deleted`, `deletedAt`, `deletedBy`, `createdBy` |
| Tenant isolation | Yes — where filter | Yes — where filter |
| Read operations | `getAll`, `findById`, `findAll`, `paginate`, `count`, `exists` | `findAllActive`, `findById`, `findAll`, `paginate`, `count`, `exists` |
| Write operations | `createClass`, `create` (inherited), `update` (inherited) | `create` (inherited), `update` (inherited), `createMissingStructure`, `bulkCreate` (inherited) |
| Delete operations | `deleteClass`, `delete` (inherited), `softDelete` (inherited) | `softDeleteBySectionId`, `deleteAllForTenant`, `delete` (inherited), `softDelete` (inherited) |
| Special operations | None | `createMissingStructure`, `deleteAllForTenant` |
| Runtime consumers | ClassService, ConfigurationDashboardService | ConfigurationDashboardService, TenantService (unused), API route |
| Service consumer | ClassService | None |
| Responsibility overlap | **High** — identical core schema, same collection, overlapping inherited methods | **High** — identical core schema, same collection |

### 4.4 Distinct Business Responsibility Assessment

**Question:** Does each repository have a distinct business responsibility?

**Answer:** NO

**Evidence:**
1. Both repositories target the same Firestore collection (`sections`).
2. Both define interfaces with identical core fields (`classGrade`, `sectionName`, `subjects`, `tenantId`, `deleted`).
3. Both inherit identical CRUD methods from `BaseRepository`.
4. `ClassRepository.getAll()` and `SectionRepository.findAllActive()` perform the same query: fetch all non-deleted documents for a tenant from the `sections` collection.
5. There is no separate "Class" persistence entity. A "Class" document does not exist independently of a "Section" document.
6. The API route `/api/v1/classes` uses `SectionRepository` for GET and DELETE operations, indicating the route itself does not distinguish between Class and Section at the repository level.
7. `ConfigurationDashboardService` calls `classRepo.getAll(tenantId)` for "configuredClasses" count and `sectionRepo.findAllActive(tenantId)` for "configuredSections" count. Both return the same set of documents, producing identical counts — a logical inconsistency.

---

## 5. Domain Model Validation

### 5.1 Current Domain Model

The current implementation models:

**E. An ambiguous hybrid model**

Evidence:
- `ClassRecord` and `Section` interfaces share identical core fields.
- No document represents a "Class" as a parent entity containing Sections.
- No document represents a "Section" as a child entity referencing a Class ID.
- Both are flat documents with `classGrade` and `sectionName` denormalized together.

### 5.2 Hierarchical Structure Support

**Question:** Is the following structure logically possible in the current implementation?

```
Class
  Grade 5
    ├── Section A
    ├── Section B
    └── Section C
```

**Answer:** NO

**Evidence:**
1. There is no `classes` collection or Class document. All data lives in the `sections` collection.
2. Each document contains both `classGrade` and `sectionName`. There is no parent-child relationship.
3. `ClassRepository` does not create a distinct Class entity; `createClass` creates a document identical to a Section document.
4. `ClassRepository.deleteClass` soft-deletes a single document by ID — it cannot delete an entire grade level (all sections of Grade 5).
5. `SectionRepository.createMissingStructure` creates multiple documents for a given structure array, but each document is still a flat class+section combination.
6. The dashboard counts "classes" by counting all documents in `sections` (via `classRepo.getAll()`), not by counting distinct `classGrade` values. This means if a tenant has Grade 5 with Sections A, B, and C, the dashboard reports 3 classes and 3 sections — both equal to the document count.

**Limitation demonstrated:** The system cannot represent Class as a parent entity with child Sections. Class and Section are the same persistence record viewed through two different repository abstractions.

---

## 6. Collection Analysis

### 6.1 Shared Collection Assessment

The fact that both repositories use `"sections"` must not be automatically classified as a defect. However, the evidence shows this is **not** an intentional shared-persistence design.

### 6.2 Evaluation

| Question | Assessment | Evidence |
|----------|-----------|----------|
| Is shared persistence intentional? | **QUESTIONABLE** | No design document or comment explains why two repositories share one collection. The naming ("ClassRepository" vs "SectionRepository") implies separate domain concepts, yet the collection name is identical. |
| Can two repositories legitimately access one collection? | **YES, but not in this case** | Shared persistence is legitimate when repositories have distinct read/write boundaries and document slices. Here, both repositories read and write the exact same documents. |
| Are read/write boundaries sufficiently distinct? | **NO** | `ClassRepository.getAll()` and `SectionRepository.findAllActive()` query identical documents. `ClassRepository.createClass()` and `SectionRepository.create()` (inherited) create identical documents. |
| Can ClassRepository accidentally modify Section state? | **YES** | `ClassRepository.update()` (inherited from BaseRepository) can modify any document in the `sections` collection, including documents that SectionRepository manages. |
| Can SectionRepository accidentally modify Class state? | **YES** | `SectionRepository.update()` (inherited) can modify any document, including those created via ClassRepository. |
| Can one repository bypass invariants of the other? | **YES** | `SectionRepository.softDeleteBySectionId()` sets `deletedBy`, but `ClassRepository.deleteClass()` does not. A document soft-deleted via ClassRepository lacks `deletedBy`. |
| Does shared persistence create data integrity risk? | **YES** | Dashboard counts classes and sections using two different repositories that return identical data, producing misleading metrics. |
| Does the dashboard count classes correctly? | **NO** | `classRepo.getAll(tenantId)` returns all non-deleted section documents. The count equals the section count, not the distinct class-grade count. |
| Does the dashboard count sections correctly? | **PARTIALLY** | `sectionRepo.findAllActive(tenantId)` correctly returns all non-deleted section documents. The count is accurate for sections but identical to the class count. |

### 6.3 Classification

**REFACTOR**

**Justification:** Shared persistence is acceptable only when repositories enforce distinct invariants and query different document slices. Here, both repositories operate on identical documents with overlapping methods. The collection can remain as `sections`, but the repository boundaries must be restructured to reflect actual domain responsibilities.

---

## 7. Responsibility Overlap

### 7.1 Method Comparison

| Method | Current Owner | Actual Semantics | Correct Owner | Action |
|--------|---------------|-----------------|---------------|--------|
| `getAll` | ClassRepository | Returns all non-deleted section documents | SectionRepository | MOVE |
| `findAll` | ClassRepository (inherited) | Returns all section documents (including deleted) | SectionRepository | MOVE |
| `findById` | ClassRepository (inherited) | Finds a section by ID | SectionRepository | MOVE |
| `create` | ClassRepository (inherited) | Creates a section document | SectionRepository | MOVE |
| `createClass` | ClassRepository | Creates a class+section document (identical to section) | ClassRepository | KEEP but redefine — should create a Class entity |
| `update` | ClassRepository (inherited) | Updates a section document | SectionRepository | MOVE |
| `delete` | ClassRepository (inherited) | Hard-deletes a section document | SectionRepository | MOVE |
| `deleteClass` | ClassRepository | Soft-deletes a single document by ID | ClassRepository | KEEP but redefine — should delete a class and cascade to sections |
| `softDelete` | ClassRepository (inherited) | Soft-deletes a section document (no `deletedBy`) | SectionRepository | MOVE |
| `paginate` | ClassRepository (inherited) | Paginates section documents | SectionRepository | MOVE |
| `count` | ClassRepository (inherited) | Counts all section documents | SectionRepository | MOVE |
| `exists` | ClassRepository (inherited) | Checks if section document exists | SectionRepository | MOVE |
| `bulkCreate` | ClassRepository (inherited) | Bulk creates section documents | SectionRepository | MOVE |
| `findAllActive` | SectionRepository | Returns non-deleted section documents | SectionRepository | KEEP |
| `softDeleteBySectionId` | SectionRepository | Soft-deletes with `deletedBy` tracking | SectionRepository | KEEP |
| `deleteAllForTenant` | SectionRepository | Batch hard-deletes all sections for a tenant | SectionRepository | KEEP |
| `createMissingStructure` | SectionRepository | Idempotent creation of section structure | SectionRepository | KEEP |

### 7.2 Business Rationale for Movements

Every proposed movement is based on actual semantics, not style:

1. **Inherited CRUD methods** (`findAll`, `findById`, `create`, `update`, `delete`, `softDelete`, `paginate`, `count`, `exists`, `bulkCreate`) operate on section documents. They belong to `SectionRepository`.
2. **`getAll`** in `ClassRepository` returns section documents. It should be in `SectionRepository`.
3. **`createClass`** and **`deleteClass`** are domain-specific methods. They should remain in `ClassRepository` but must be redefined to operate on actual Class entities, not section documents.
4. **`findAllActive`**, **`softDeleteBySectionId`**, **`deleteAllForTenant`**, and **`createMissingStructure`** are Section-specific and should remain in `SectionRepository`.

---

## 8. Service Layer Analysis

### 8.1 Dependency Classification

| Dependency | Type | Classification | Evidence |
|------------|------|---------------|----------|
| Route `/api/v1/classes` GET → `new SectionRepository()` | Route → Repository | **VIOLATION** | `app/api/v1/classes/route.ts:20` — direct repository instantiation in route handler |
| Route `/api/v1/classes` POST → `classService.createClass()` | Route → Service → Repository | **VALID** | `app/api/v1/classes/route.ts:42` — proper service-layer invocation |
| Route `/api/v1/classes` DELETE → `new SectionRepository()` | Route → Repository | **VIOLATION** | `app/api/v1/classes/route.ts:74` — direct repository instantiation in route handler |
| `ClassService` → `ClassRepository` | Service → Repository | **VALID** | `services/class.service.ts:2,7` — service depends on repository |
| `ConfigurationDashboardService` → `ClassRepository` | Service → Repository | **VALID** | `services/configuration-dashboard.service.ts:7,35` — service depends on repository |
| `ConfigurationDashboardService` → `SectionRepository` | Service → Repository | **VALID** | `services/configuration-dashboard.service.ts:8,36` — service depends on repository |
| `TenantService` → `SectionRepository` | Service → Repository | **QUESTIONABLE** | `services/tenant.service.ts:3,21,27` — imported and instantiated but **unused** in current implementation |
| `TenantSetupRepository` → direct Firestore batch write to `sections` | Repository → Persistence | **VALID but bypasses domain layer** | `repositories/tenant-setup.repository.ts:88-102` — writes directly to `sections` collection without using either repository |

### 8.2 Violations

**Violation 1:** Route `/api/v1/classes` GET handler directly instantiates `SectionRepository` and calls `findAllActive(tenantId)`. This bypasses `ClassService` and any future service-level business logic.

**Violation 2:** Route `/api/v1/classes` DELETE handler directly instantiates `SectionRepository` and calls `softDeleteBySectionId()`. This bypasses `ClassService` and audit logging is performed ad-hoc in the route rather than in a service.

**Violation 3:** `TenantSetupRepository` writes directly to the `sections` collection during school setup, bypassing both `ClassRepository` and `SectionRepository`. This creates a maintenance risk: any invariant enforced by the repositories can be bypassed during tenant initialization.

---

## 9. Interface Governance

### 9.1 IClassRepository Review

```typescript
// interfaces/IClassRepository.ts
export interface IClassRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  createClass(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  deleteClass(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  getAll(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
```

**Findings:**
- All methods use `...args: any[]` and `Promise<any>`, providing no type safety.
- 10 of 13 methods are inherited from `BaseRepository` and should not be in the domain-specific interface.
- Only `createClass` and `deleteClass` are domain-specific.
- `getAll` is domain-specific but semantically belongs to Section operations.

**Target Interface Design:**

```typescript
// Target IClassRepository
export interface IClassRepository {
  createClass(data: { classGrade: string; sectionName: string; subjects?: { core: string[]; electives: string[] }; createdBy?: string }, tenantId: string): Promise<string>;
  deleteClass(classId: string, tenantId: string): Promise<void>;
  getClasses(tenantId: string): Promise<ClassRecord[]>;
  getClassById(id: string, tenantId: string): Promise<ClassRecord | null>;
  getClassGrades(tenantId: string): Promise<string[]>;
}
```

### 9.2 ISectionRepository Review

```typescript
// interfaces/ISectionRepository.ts
export interface ISectionRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  createMissingStructure(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  deleteAllForTenant(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findAllActive(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  softDeleteBySectionId(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
```

**Findings:**
- 10 of 14 methods are inherited from `BaseRepository` and should not be in the domain-specific interface.
- `createMissingStructure`, `deleteAllForTenant`, and `softDeleteBySectionId` are domain-specific.

**Target Interface Design:**

```typescript
// Target ISectionRepository
export interface ISectionRepository {
  createSection(data: { classGrade: string; sectionName: string; incharge?: string; subjects?: { core: string[]; electives: string[] }; createdBy?: string }, tenantId: string): Promise<string>;
  updateSection(id: string, data: Partial<Section>, tenantId: string): Promise<void>;
  softDeleteSection(id: string, tenantId: string, userId: string): Promise<void>;
  deleteSection(id: string, tenantId: string): Promise<void>;
  getSections(tenantId: string): Promise<Section[]>;
  getActiveSections(tenantId: string): Promise<Section[]>;
  getSectionById(id: string, tenantId: string): Promise<Section | null>;
  getSectionsByClassGrade(classGrade: string, tenantId: string): Promise<Section[]>;
  createMissingStructure(tenantId: string, structure: Array<{ classGrade: string; sectionName: string; subjects: { core: string[]; electives: string[] } }>, userId: string): Promise<number>;
  deleteAllForTenant(tenantId: string): Promise<void>;
  countSections(tenantId: string): Promise<number>;
}
```

---

## 10. Dependency Direction

### 10.1 Intended Direction

```
API Route
    ↓
Application Service
    ↓
Domain/Repository Interface
    ↓
Repository Implementation
    ↓
Persistence (Firestore)
```

### 10.2 Current Violations

| Violation | Location | Severity |
|-----------|----------|----------|
| Route → Repository | `/app/api/v1/classes/route.ts:20` — GET handler instantiates `SectionRepository` | HIGH |
| Route → Repository | `/app/api/v1/classes/route.ts:74` — DELETE handler instantiates `SectionRepository` | HIGH |
| Repository → Persistence (bypass) | `/repositories/tenant-setup.repository.ts:88-102` — writes directly to `sections` collection | MEDIUM |
| Service → Unused Repository | `/services/tenant.service.ts:3,21,27` — imports and instantiates `SectionRepository` but never calls it | LOW |

### 10.3 Dependency Matrix

| Source | ClassRepository | SectionRepository | ClassService | TenantService | ConfigurationDashboardService | API Route |
|--------|----------------|-------------------|--------------|---------------|-------------------------------|-----------|
| ClassRepository | — | — | ✓ | — | ✓ | — |
| SectionRepository | — | — | — | ✗ (unused) | ✓ | ✓ (direct) |
| ClassService | ✓ | — | — | — | — | ✓ |
| TenantService | — | ✗ (unused) | — | — | — | — |
| ConfigurationDashboardService | ✓ | ✓ | — | — | — | — |
| API Route | — | ✓ (direct) | ✓ | — | — | — |

Legend: ✓ = valid dependency, ✗ = violation/questionable

---

## 11. Architecture Violations

### Violation 1: Duplicate Repository Abstraction

**Severity:** HIGH

Both `ClassRepository` and `SectionRepository` target the same collection with overlapping schemas. This creates two parallel abstractions for the same persistence entity, leading to confusion about which repository to use and inconsistent invariants.

### Violation 2: Route → Repository Bypass

**Severity:** HIGH

The `/api/v1/classes` route directly instantiates `SectionRepository` in GET and DELETE handlers. This bypasses the service layer, making it impossible to enforce business rules consistently.

### Violation 3: Dashboard Counting Inconsistency

**Severity:** MEDIUM

`ConfigurationDashboardService` counts "classes" via `classRepo.getAll(tenantId)` and "sections" via `sectionRepo.findAllActive(tenantId)`. Both return the same document set, so `counts.classes === counts.sections`. This produces misleading dashboard metrics.

### Violation 4: Unused Service Dependency

**Severity:** LOW

`TenantService` imports and instantiates `SectionRepository` but never uses it. This indicates unclear ownership of section operations during tenant setup.

### Violation 5: Tenant Setup Bypasses Domain Layer

**Severity:** MEDIUM

`TenantSetupRepository.setupSchool()` writes directly to the `sections` collection via Firestore batch operations, bypassing both `ClassRepository` and `SectionRepository`. Any future invariant changes in the repositories would not apply to tenant initialization.

---

## 12. Target Architecture

### 12.1 Target Domain Model

```
Class (parent entity)
  ├── classId (auto-generated)
  ├── classGrade (e.g., "5", "10")
  ├── subjects (inherited/default)
  ├── tenantId
  ├── createdBy
  ├── createdAt
  └── updatedAt

Section (child entity)
  ├── sectionId (auto-generated)
  ├── classId (reference to parent Class)
  ├── sectionName (e.g., "A", "B")
  ├── incharge (teacher reference)
  ├── subjects (class-level overrides)
  ├── tenantId
  ├── deleted
  ├── deletedAt
  ├── deletedBy
  └── createdBy
```

**EVIDENCE INSUFFICIENT — ADDITIONAL AUDIT REQUIRED:** The target domain model above is a recommendation. Whether the system should adopt a true parent-child model (separate `classes` and `sections` collections) or keep a single `sections` collection with a `classId` field requires business stakeholder validation. This document does not assume that model change is required or approved.

### 12.2 Target Repository Boundaries

| Repository | Responsibility | Collection |
|------------|---------------|------------|
| `ClassRepository` | Class-level CRUD (create class, get distinct grades, delete class and cascade to sections) | `classes` (recommended) or `sections` with class-level queries |
| `SectionRepository` | Section-level CRUD (create section, soft-delete section, find sections by class) | `sections` |

**If keeping single `sections` collection:**
- `ClassRepository` queries distinct `classGrade` values and manages class-level metadata.
- `SectionRepository` manages individual section documents.
- Both can share the collection if queries are sufficiently distinct.

### 12.3 Target Interfaces

See Section 9 for proposed target interface designs.

### 12.4 Target Service Boundaries

| Service | Responsibility |
|---------|---------------|
| `ClassService` | Class-level business logic (create class, delete class, list classes) |
| `SectionService` | Section-level business logic (create section, soft-delete section, list sections by class) |
| `ConfigurationDashboardService` | Dashboard metrics using both services |

### 12.5 Target Dependency Direction

```
/api/v1/classes Route
    ↓
ClassService / SectionService
    ↓
IClassRepository / ISectionRepository
    ↓
ClassRepository / SectionRepository
    ↓
Firestore
```

**Rule:** No route may directly instantiate a repository. All repository access must flow through a service.

### 12.6 Target Persistence Strategy

**RECOMMENDATION:** Keep the `sections` collection. Do NOT migrate to a separate `classes` collection unless business requirements explicitly demand it. A single collection is valid if:
1. `ClassRepository` and `SectionRepository` enforce distinct query boundaries.
2. ClassRepository never modifies individual section documents without cascading.
3. SectionRepository never creates or modifies class-level metadata.

**If keeping single collection:** Add a `classId` field to section documents to enable parent-child queries without scanning all documents.

### 12.7 Tenant Isolation Strategy

Current strategy is valid: all queries filter by `tenantId`. Maintain this invariant in both repositories. BaseRepository's `update` and `delete` methods already enforce tenant ownership checks.

### 12.8 Backward Compatibility Strategy

- Maintain existing API routes and response shapes.
- Internal refactoring only: repository and service layer changes must not alter API contracts.
- `ClassRepository.getAll()` → rename to `getSections()` or move to `SectionRepository`, but ensure `ClassService.getAllClasses()` still returns the expected shape.
- Dashboard counts must be corrected to use distinct class-grade counting, but the API response structure should remain unchanged.

---

## 13. Migration Strategy

### Phase 1: Boundary Definitions
- Document exact responsibilities for `ClassRepository` and `SectionRepository`.
- Define which methods belong to each repository.
- Identify all runtime consumers and their dependencies.

### Phase 2: Interface Tightening
- Replace `...args: any[]` with strongly typed signatures in `IClassRepository` and `ISectionRepository`.
- Remove inherited methods from domain-specific interfaces.
- Add `classId` field to `Section` interface if adopting parent-child model.

### Phase 3: Dependency Validation
- Ensure no route directly instantiates a repository.
- Remove unused `SectionRepository` import from `TenantService` or add actual usage.
- Route `/api/v1/classes` GET and DELETE must use `ClassService`.

### Phase 4: Service Adjustments
- Create `SectionService` if section-specific business logic is needed.
- Update `ClassService` to delegate class-level operations to `ClassRepository` and section-level operations to `SectionService`.
- Update `ConfigurationDashboardService` to count distinct `classGrade` values for class count.

### Phase 5: Repository Adjustments
- Move inherited CRUD methods from `ClassRepository` to `SectionRepository`.
- Redefine `createClass` and `deleteClass` in `ClassRepository` to operate on class entities, not section documents.
- Ensure `TenantSetupRepository` uses `ClassRepository`/`SectionRepository` or `ClassService`/`SectionService` for section creation.

### Phase 6: Tests
- Update `class.repository.test.ts` to reflect new `ClassRepository` semantics.
- Update `section.repository.test.ts` to include moved methods.
- Add dashboard count tests verifying `classes !== sections` when multiple sections belong to one class.
- Add route integration tests verifying service-layer usage.

### Phase 7: Build
- Run TypeScript type checking.
- Run lint checks.
- Run existing test suite.

### Phase 8: Runtime Verification
- Deploy to staging.
- Verify dashboard metrics show distinct class and section counts.
- Verify tenant setup creates sections correctly.
- Verify API routes return expected responses.

### Phase 9: Commit
- Commit refactored repositories, services, interfaces, and tests.
- Update documentation.

### Phase 10: STOP

No further changes without explicit governance approval.

---

## 14. Risk Assessment

| Risk Category | Level | Explanation |
|---------------|-------|-------------|
| Technical Risk | **MEDIUM** | Refactoring repository boundaries and moving methods requires careful coordination. The `sections` collection remains, but method ownership changes could break callers if not tracked. |
| Runtime Risk | **MEDIUM** | Route handlers currently bypass the service layer. Redirecting them through services changes execution paths and may surface unhandled errors. |
| Data Integrity Risk | **MEDIUM** | Dashboard counts are currently incorrect (`classes === sections`). The fix requires changing how counts are computed, which may affect downstream consumers of dashboard metrics. |
| Tenant Isolation Risk | **LOW** | Both repositories already enforce `tenantId` filtering. The refactoring does not change tenant isolation logic. |
| Backward Compatibility Risk | **MEDIUM** | API response shapes must remain unchanged, but internal method signatures and repository interfaces will change. Consumers using interfaces directly (if any) will break. |
| Migration Risk | **LOW** | No database migration is required. The `sections` collection remains. Changes are limited to application-layer boundaries. |
| Rollback Complexity | **LOW** | Changes are confined to repositories, services, interfaces, and routes. Rolling back requires reverting these files without database impact. |

---

## 15. Test Strategy

### Required Tests

| Test Type | Scope | Invariants |
|-----------|-------|-----------|
| Unit Tests | `ClassRepository` | `createClass` creates a document with correct fields; `deleteClass` soft-deletes by ID |
| Unit Tests | `SectionRepository` | `findAllActive` excludes deleted; `softDeleteBySectionId` sets `deletedBy`; `createMissingStructure` is idempotent |
| Repository Tests | `ClassRepository` | Class-level queries return distinct class grades |
| Repository Tests | `SectionRepository` | Section-level queries return correct sections by class grade |
| Service Tests | `ClassService` | Service delegates to `ClassRepository` correctly |
| Service Tests | `SectionService` (new) | Service delegates to `SectionRepository` correctly |
| API Integration Tests | `/api/v1/classes` | GET, POST, DELETE return expected shapes and status codes |
| Tenant Isolation Tests | Both repositories | A tenant cannot access another tenant's classes or sections |
| Class/Section Relationship Tests | Dashboard service | When one class has three sections, `classes === 1` and `sections === 3` |
| Dashboard Count Tests | `ConfigurationDashboardService` | `configuredClasses` counts distinct class grades; `configuredSections` counts section documents |
| Soft-Delete Tests | Both repositories | Deleted documents are excluded from `findAllActive` and `getAll` |
| Regression Tests | Full suite | Existing API consumers receive unchanged response shapes |

### Expected Invariants

1. A tenant cannot access another tenant's Class.
2. A tenant cannot access another tenant's Section.
3. Deleted Sections are not counted as active.
4. Deleted Classes cascade to their Sections (or are excluded from class counts).
5. Class counts must not equal Section counts when multiple Sections belong to one Class.
6. Existing APIs must remain backward compatible.
7. No route may directly instantiate a repository.
8. All repository methods must enforce tenant ownership checks.

---

## 16. Rollback Strategy

1. **No database migration** is proposed. The `sections` collection remains unchanged.
2. **Code-only rollback:** Revert commits for repositories, services, interfaces, and routes.
3. **Rollback triggers:**
   - Dashboard metrics show incorrect counts after deployment.
   - API routes return errors or incorrect shapes.
   - Tenant setup fails to create sections.
4. **Rollback verification:** Run the existing test suite and verify API integration tests pass.
5. **Rollback complexity:** LOW — no data transformation required.

---

## 17. Governance Decision

**Decision:** `APPROVE — REFACTOR`

**Risk:** MEDIUM

**Reason:** The current architecture exhibits duplicate repository abstraction over a single persistence entity, with ambiguous domain boundaries, route-to-repository violations, and incorrect dashboard counting. The `sections` collection can remain, but repository responsibilities must be clarified, interfaces must be tightened, and service-layer boundaries must be enforced.

**Required Changes:**
1. Redefine `ClassRepository` to manage class-level entities and distinct class-grade queries.
2. Move all section-level inherited CRUD methods from `ClassRepository` to `SectionRepository`.
3. Create `SectionService` and redirect route handlers through the service layer.
4. Tighten `IClassRepository` and `ISectionRepository` with strongly typed signatures.
5. Fix `ConfigurationDashboardService` to count distinct class grades for class metrics.
6. Update `TenantSetupRepository` to use domain services for section creation.
7. Add route integration tests enforcing service-layer usage.

**Database Migration Required:** NO — the `sections` collection remains unchanged.

**Breaking API Change:** NO — API response shapes and routes remain unchanged.

**Rollback Complexity:** LOW — code-only changes with no data migration.

**Implementation Priority:** HIGH — the dashboard counting bug affects tenant onboarding metrics and should be corrected promptly.

---

## 18. Approval Gate

| Gate | Status | Notes |
|------|--------|-------|
| Boundary | **CONDITIONAL** | Repository boundaries are currently overlapping. PASS after refactoring. |
| Interfaces | **FAIL** | `IClassRepository` and `ISectionRepository` use `...args: any[]` and `Promise<any>`. Must be tightened. |
| Dependencies | **FAIL** | Routes `/api/v1/classes` GET and DELETE bypass the service layer. Must be corrected. |
| Target Architecture | **CONDITIONAL** | Proposed architecture is sound but requires business validation of the Class/Section domain model. |
| Migration Safety | **PASS** | No database migration required. Changes are confined to application layer. |

**Overall Decision:** `APPROVE — REFACTOR`

Implementation may proceed after the interface and dependency violations are addressed in the refactoring plan.

---

*Document generated by Enterprise Architecture Governance Board (EAGB).*
*Scope: Finding #3 — Class / Section Repository Boundary.*
*Mode: Read-only governance review. No code modifications performed.*
