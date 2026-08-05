# EduPilot Enterprise Governance Program (EGP)
## Phase 4 — Dependency Validation
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 4: DEPENDENCY VALIDATION

### Mandatory Dependency Chain
Route → Service → Repository → BaseRepository → Firestore

### Dependency Graph Analysis

---

### Graph 1: Student Module

```
Route (app/api/v1/students/route.ts)
  ↓ (instantiates)
StudentService (services/StudentService.ts)
  ↓ (depends on)
IStudentRepository (interfaces/IStudentRepository.ts)
  ↓ (implements)
StudentRepository (repositories/student.repository.ts)
  ↓ (extends)
BaseRepository (repositories/base.repository.ts)
  ↓ (uses)
adminDb (lib/firebase-admin.ts) → Firestore
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** Firestore (via BaseRepository) — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/dto`, `@/entities`, `@/types` — VALID

**Verdict:** COMPLIANT

---

### Graph 2: Staff Module

```
Route (app/api/v1/staff/route.ts)
  ↓ (instantiates)
StaffService (services/StaffService.ts)
  ↓ (depends on)
IStaffRepository (interfaces/IStaffRepository.ts)
  ↓ (implements)
StaffRepository (repositories/staff.repository.ts)
  ↓ (extends)
BaseRepository (repositories/base.repository.ts)
  ↓ (uses)
adminDb (lib/firebase-admin.ts) → Firestore
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** StaffService also depends on `AttendanceRepository` (for attendance data) — this is a CROSS-DOMAIN dependency. `AttendanceRepository` belongs to the Attendance domain, not the Staff domain.
**Infrastructure dependency:** Firestore (via BaseRepository) — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/dto`, `@/entities`, `@/types` — VALID

**Verdict:** COMPLIANT (cross-domain dependency is acceptable for read-only analytics)

---

### Graph 3: Fee Module

```
Route (app/api/v1/fees/route.ts)
  ↓ (instantiates)
FeesService (services/fees.service.ts)
  ↓ (depends on)
IFeesRepository (interfaces/IFeesRepository.ts)
  ↓ (implements)
FeesRepository (repositories/fees.repository.ts)
  ↓ (extends)
BaseRepository (repositories/base.repository.ts)
  ↓ (uses)
adminDb (lib/firebase-admin.ts) → Firestore
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** Firestore — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/dto`, `@/entities`, `@/types` — VALID

**Verdict:** COMPLIANT

---

### Graph 4: Configuration Dashboard Module (REFACTOR TARGET)

```
Route (app/api/v1/configuration/dashboard/route.ts)
  ↓ (imports singleton)
ConfigurationDashboardService (services/configuration-dashboard.service.ts)
  ↓ (depends on — 7 repositories)
ConfigurationRepository
AcademicYearRepository
ClassRepository
SectionRepository
StudentRepository
StaffRepository
ParentsRepository
  ↓ (all extend)
BaseRepository (repositories/base.repository.ts)
  ↓ (uses)
adminDb (lib/firebase-admin.ts) → Firestore
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** ConfigurationDashboardService depends on repositories from 6 different domains (configuration, academic-year, class, section, student, staff, parents). This is a CROSS-DOMAIN dependency that violates SRP — the dashboard service aggregates data from multiple bounded contexts.
**Infrastructure dependency:** Firestore — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/types/configuration`, `@/types/api` — VALID

**Verdict:** COMPLIANT with Route → Service → Repository chain (refactored in ADR-001 Phase 1), but the 7-repository dependency is a DESIGN SMELL. Consider a read-model or CQRS pattern for dashboard aggregation.

---

### Graph 5: Classes Route (VIOLATION)

```
Route (app/api/v1/classes/route.ts)
  ↓ (directly instantiates)
SectionRepository (repositories/section.repository.ts)
  ↓ (extends)
BaseRepository (repositories/base.repository.ts)
  ↓ (uses)
adminDb (lib/firebase-admin.ts) → Firestore

Route ALSO imports:
  FieldValue from "firebase-admin/firestore" ← DIRECT FIRESTORE ACCESS (VIOLATION)
  AuditService (services/AuditService.ts)
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** DIRECT Firestore SDK import — VIOLATION
**UI dependency:** NONE
**Shared Kernel dependency:** `@/route-helpers`, `@/lib/auth` — VALID

**Verdict:** VIOLATION — Route directly instantiates repository and imports Firestore SDK. Must refactor to Route → ClassService → SectionRepository → BaseRepository → Firestore.

---

### Graph 6: AI Routes (VIOLATION)

```
Route (app/api/v1/ai/agents/route.ts)
  ↓ (directly uses)
AgentRegistry (@/lib/ai/agents/AgentRegistry.ts)
  ↓ (depends on)
AIGateway (@/lib/ai/gateway/AIGateway.ts)
  ↓ (depends on)
GeminiProvider (@/lib/ai/providers/GeminiProvider.ts)
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** NONE (AI SDK, not Firestore)
**UI dependency:** NONE
**Shared Kernel dependency:** NONE — routes depend directly on AI infrastructure

**Verdict:** VIOLATION — No service layer. Routes depend directly on AI infrastructure libraries. Must refactor to Route → AIService → AgentRegistry/AIGateway.

---

### Graph 7: Stripe Routes (VIOLATION)

```
Route (app/api/v1/stripe/create-checkout/route.ts)
  ↓ (directly uses)
stripe SDK (@stripe/stripe-js)
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** Stripe SDK — direct dependency in route
**UI dependency:** NONE
**Shared Kernel dependency:** NONE

**Verdict:** VIOLATION — No service layer. Route depends directly on Stripe SDK. Must refactor to Route → BillingService → Stripe SDK.

---

### Graph 8: OCR Routes (VIOLATION)

```
Route (app/api/v1/students/ocr-admission/route.ts)
  ↓ (directly uses)
tesseract.js, pdf-parse, mammoth
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** OCR libraries — direct dependency in route
**UI dependency:** NONE
**Shared Kernel dependency:** NONE

**Verdict:** VIOLATION — No service layer. Route depends directly on OCR libraries. Must refactor to Route → OCRService → OCR libraries.

---

### Graph 9: Background Jobs (VIOLATION)

```
Route (app/api/v1/jobs/attendance-report/route.ts)
  ↓ (directly instantiates)
TenantRepository, AttendanceRepository
  ↓ (also uses)
AttendanceService (but also instantiates repositories directly)

Route (app/api/v1/jobs/fee-reminder/route.ts)
  ↓ (directly instantiates)
FeesRepository, TenantRepository
  ↓ (NO service layer)

Route (app/api/v1/jobs/events/route.ts)
  ↓ (directly uses)
EventWorker (@/lib/workers/event.worker.ts)
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** Jobs span multiple domains (attendance, fees, events)
**Infrastructure dependency:** Direct repository instantiation in routes
**UI dependency:** NONE
**Shared Kernel dependency:** NONE

**Verdict:** VIOLATION — Multiple routes directly instantiate repositories or use workers without service layer. Must refactor to Route → BackgroundJobService → Repositories/Workers.

---

### Graph 10: Education Rules (VIOLATION)

```
Route (app/api/v1/education/rules/route.ts)
  ↓ (directly uses)
educationRulesEngine
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** NONE
**Infrastructure dependency:** Education rules engine — direct dependency in route
**UI dependency:** NONE
**Shared Kernel dependency:** NONE

**Verdict:** VIOLATION — No service layer. Route depends directly on education rules engine. Must refactor to Route → EducationRulesService → educationRulesEngine.

---

### Graph 11: Configuration Service (VALID)

```
Route (app/api/v1/settings/school-configuration/route.ts)
  ↓ (imports singleton)
ConfigurationService (services/configuration.service.ts)
  ↓ (depends on)
ConfigurationRepository → BaseRepository → Firestore
ConfigurationCacheService → MemoryCacheProvider
ConfigurationHealthService → ConfigurationRepository, TenantRepository
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** ConfigurationService depends on TenantRepository (cross-domain) — acceptable for health checks
**Infrastructure dependency:** Firestore (via BaseRepository), MemoryCache — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/types/configuration`, `@/types/viewmodels` — VALID

**Verdict:** COMPLIANT

---

### Graph 12: Tenant Service (VALID)

```
Route (app/api/v1/create-user/route.ts)
  ↓ (imports singleton)
TenantService (services/tenant.service.ts)
  ↓ (depends on)
TenantRepository → BaseRepository → Firestore
TenantSetupRepository → BaseRepository → Firestore
SectionRepository → BaseRepository → Firestore
AcademicYearRepository → BaseRepository → Firestore
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** TenantService depends on SectionRepository and AcademicYearRepository — cross-domain but acceptable for school setup
**Infrastructure dependency:** Firestore — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/types/configuration` — VALID

**Verdict:** COMPLIANT

---

### Graph 13: Auth Service (VALID)

```
Route (app/api/v1/auth/login/route.ts)
  ↓ (imports singleton)
AuthService (services/auth.service.ts)
  ↓ (depends on)
AuthRepository → BaseRepository → Firestore
UserRepository → BaseRepository → Firestore
ClaimsService → AuthRepository
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** AuthService depends on UserRepository (cross-domain) — acceptable for user lookup
**Infrastructure dependency:** Firestore — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/types/auth` — VALID

**Verdict:** COMPLIANT

---

### Graph 14: Dashboard Service (VALID)

```
Route (app/api/v1/dashboard/route.ts)
  ↓ (imports singleton)
DashboardService (services/dashboard.service.ts)
  ↓ (depends on)
StudentService → StudentRepository → BaseRepository → Firestore
StaffService → StaffRepository → BaseRepository → Firestore
FeesService → FeesRepository → BaseRepository → Firestore
AttendanceService → AttendanceRepository → BaseRepository → Firestore
```

**Circular dependency:** NONE
**Reverse dependency:** NONE
**Cross-domain dependency:** DashboardService depends on StudentService, StaffService, FeesService, AttendanceService — cross-domain aggregation, acceptable for dashboard
**Infrastructure dependency:** Firestore — VALID
**UI dependency:** NONE
**Shared Kernel dependency:** `@/types/api`, `@/interfaces/IDashboardService` — VALID

**Verdict:** COMPLIANT

---

### PHASE 4 SUMMARY

| Dependency Graph | Status | Violation Type |
|---|---|---|
| Student Module | COMPLIANT | — |
| Staff Module | COMPLIANT | — |
| Fee Module | COMPLIANT | — |
| Configuration Dashboard | COMPLIANT (design smell) | 7-repository dependency |
| Classes Route | VIOLATION | Direct repo instantiation + Firestore SDK import |
| AI Routes | VIOLATION | Missing service layer |
| Stripe Routes | VIOLATION | Missing service layer |
| OCR Routes | VIOLATION | Missing service layer (OCRService exists but unused) |
| Background Jobs | VIOLATION | Missing service layer |
| Education Rules | VIOLATION | Missing service layer |
| Configuration Service | COMPLIANT | — |
| Tenant Service | COMPLIANT | — |
| Auth Service | COMPLIANT | — |
| Dashboard Service | COMPLIANT | — |

**Total violations: 6**
**Total compliant: 8**
**Total design smells: 1**

