# Service Layer Baseline

**Generated:** 2026-07-28
**Sprint:** 6 — Service Layer Enforcement
**Status:** VERIFIED — CURRENT SOURCE CODE

---

## Verified Baseline

### Route Analysis

| Metric | Count | Status |
|--------|-------|--------|
| Total API routes | 118 | — |
| Routes with services | 86 | Compliant |
| Routes bypassing services (repo only) | 16 | Violation |
| Routes importing neither | 15 | Gap |
| Routes using Firestore/adminDb directly | 0 | Compliant |

### Bypass Routes (16)

| # | Route | Repository | Complexity |
|---|-------|-----------|------------|
| 1 | `academic-year/[id]/route.ts` | AcademicYearRepository | LOW |
| 2 | `academic-year/route.ts` | AcademicYearRepository | LOW |
| 3 | `addons/route.ts` | AddonsRepository | LOW |
| 4 | `admin/users/route.ts` | UserRepository | LOW |
| 5 | `admit-cards/bulk/route.ts` | StudentRepository | MEDIUM (PDF generation) |
| 6 | `certificate/route.ts` | StudentRepository | MEDIUM (PDF generation) |
| 7 | `chat/route.ts` | ChatRepository | LOW |
| 8 | `cron/fee-reminder/route.ts` | FeesRepository, StudentRepository, TenantRepository | MEDIUM (cron) |
| 9 | `jobs/[jobId]/route.ts` | JobRepository | LOW |
| 10 | `leave/arrange/route.ts` | LeaveRepository, StaffRepository | LOW |
| 11 | `leave/route.ts` | LeaveRepository, StaffRepository | LOW |
| 12 | `ledger/route.ts` | LedgerRepository | LOW |
| 13 | `reports/generate/route.tsx` | StudentRepository, MarksRepository, SettingsRepository | MEDIUM (PDF) |
| 14 | `settings/general/route.ts` | SettingsRepository | LOW |
| 15 | `syllabus/[id]/route.ts` | SyllabusRepository | LOW |
| 16 | `syllabus/route.ts` | SyllabusRepository | LOW |

### Services Using adminDb Directly (2)

| # | Service | Lines | Usage |
|---|---------|-------|-------|
| 1 | `services/tenant.resolver.ts` | 1, 96 | `adminDb.collection("tenants").doc(tenantId).get()` |
| 2 | `services/configuration-health.service.ts` | 1, 21, 28 | `adminDb.collection("tenants")...` |

### Interface Coverage

| Category | Implemented | Total | Coverage |
|----------|-----------|-------|----------|
| Services | 37 | 40 | 92.5% |
| Repositories | 38 | 43 | 88.4% |

### Missing Service Interfaces

| Service | Missing Interface |
|---------|------------------|
| `services/job.service.ts` | `IJobService` exists but not implemented |
| `services/upload.service.ts` | No interface |

### Missing Repository Interfaces

| Repository | Missing Interface |
|------------|------------------|
| `repositories/auth.repository.ts` | None |
| `repositories/storage.repository.ts` | None |
| `repositories/tenant-setup.repository.ts` | None |

---

## Violation Categories

### Category 1: Route → Repository Bypass (16 routes)

These routes import repositories directly without going through a service layer.

**Complexity Breakdown:**
- LOW (10 routes): Simple CRUD operations that can be wrapped in services
- MEDIUM (4 routes): PDF generation or complex business logic
- SPECIAL (2 routes): Cron jobs that may be legitimate exceptions

### Category 2: Service → adminDb Bypass (2 services)

These services bypass the repository abstraction by accessing Firestore directly.

**Impact:** HIGH — Violates repository pattern, makes testing difficult, couples services to Firestore.

### Category 3: Missing Service Interfaces (2 services)

These services do not implement their declared interfaces.

---

## Implementation Strategy

### Phase 1: Create Missing Services (10 routes)

For simple CRUD routes, create thin service wrappers:

1. `AcademicYearService` — wrap `AcademicYearRepository`
2. `AddonsService` — wrap `AddonsRepository`
3. `UserAdminService` — wrap `UserRepository`
4. `ChatService` — wrap `ChatRepository`
5. `LedgerService` — wrap `LedgerRepository`
6. `SettingsGeneralService` — wrap `SettingsRepository`
7. `SyllabusService` — wrap `SyllabusRepository`

### Phase 2: Enhance Existing Services (2 routes)

For routes that already have services but bypass them:

1. `JobService` — enhance to cover `jobs/[jobId]/route.ts`
2. `ReportService` — enhance to cover `reports/generate/route.tsx`

### Phase 3: Handle Special Cases (4 routes)

For routes with PDF generation or cron logic:

1. `AdmitCardService` — new service with PDF generation
2. `CertificateService` — new service with PDF generation
3. `FeeReminderService` — new service for cron job
4. Document cron exception if appropriate

### Phase 4: Move adminDb to Repositories (2 services)

1. `TenantRepository` — add `verifyTenantExists(tenantId)` method
2. `ConfigurationRepository` — add `checkHealth(tenantId)` method

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing route behavior | MEDIUM | HIGH | Maintain exact same request/response contracts |
| PDF generation breakage | LOW | MEDIUM | Keep PDF logic in services, not routes |
| Cron job timing changes | LOW | LOW | Preserve exact cron logic |
| adminDb method signature mismatch | LOW | MEDIUM | Verify repository methods before migration |

---

## Definition of Done

- [ ] Zero routes import repositories without also importing services
- [ ] Zero services import adminDb directly
- [ ] All verification commands pass
- [ ] No test regressions
- [ ] Architecture score ≥75/100
