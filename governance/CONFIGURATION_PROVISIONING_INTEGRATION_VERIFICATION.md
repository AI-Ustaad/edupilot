# Configuration Provisioning Integration Verification

**Date:** 2026-08-18
**Scope:** Configuration provisioning end-to-end integration proof
**Mode:** Integration test via in-memory Firestore + source trace. No production Firestore was accessed.
**Companion:** `__tests__/services/configuration-provisioning.e2e.integration.test.ts`

---

## 1. Runtime Path

```
Configuration Wizard UI
  → POST /api/v1/settings/school-configuration
    → withAuth / withTenant middleware
      → ConfigurationService.saveAndPublishConfiguration(parsed.data, tenantId, userId)
        → ConfigurationRepository.publishConfiguration(tenantId, newConfig, userId)
          → tenants/{tenantId}/settings/config (Firestore)
        → ConfigurationProvisioningService.provisionFromConfiguration(tenantId, newConfig, userId)
          → AcademicYearRepository.createIfAbsentByName(...)
            → academicYears collection (Firestore)
          → SectionRepository.createMissingSections(...)
            → sections collection (Firestore)
          → DepartmentRepository.createAbsentByName(...)
            → departments collection (Firestore)
        → ConfigurationRepository.saveConfiguration(tenantId, newConfig)
          → tenants/{tenantId}/settings/config updated with academicYearId
        → ConfigurationCacheService.invalidateConfiguration(tenantId)
      → createSuccessResponse({ configuration: result, status: "CONFIGURED" })

Dashboard Read Path:
  GET /api/v1/configuration/dashboard
    → ConfigurationDashboardService.getDashboardMetrics(tenantId)
      → ConfigurationRepository.getConfiguration(tenantId)
      → AcademicYearRepository.findAllByTenant(tenantId)
      → ClassRepository.getAll(tenantId)
      → SectionRepository.findAllActive(tenantId)
      → DepartmentRepository.getAll(tenantId)
      → calcCompletion(...)
    → createSuccessResponse(metrics)

Hook Path:
  useConfigurationDashboard()
    → apiClient.get("/configuration/dashboard")
    → payload = res?.data?.data ?? res?.data
    → safeObject(payload)
    → UI renders metrics
```

---

## 2. Files Verified

| Layer | File | Function |
|---|---|---|
| Save Route | `app/api/v1/settings/school-configuration/route.ts` | `POST` handler → `saveAndPublishConfiguration` |
| Configuration Service | `services/configuration.service.ts` | `saveAndPublishConfiguration` |
| Configuration Repository | `repositories/configuration.repository.ts` | `publishConfiguration`, `saveConfiguration` |
| Provisioning Service | `services/configuration-provisioning.service.ts` | `provisionFromConfiguration` |
| Academic Year Repository | `repositories/academic-year.repository.ts` | `createIfAbsentByName`, `findAllByTenant`, `setCurrent` |
| Section Repository | `repositories/section.repository.ts` | `createMissingSections`, `findAllIncludingDeleted` |
| Department Repository | `repositories/department.repository.ts` | `createAbsentByName`, `getAll` |
| Dashboard Service | `services/configuration-dashboard.service.ts` | `getDashboardMetrics`, `getCounts`, `calcCompletion` |
| Dashboard Route | `app/api/v1/configuration/dashboard/route.ts` | `GET` handler |
| Dashboard Hook | `hooks/useConfigurationDashboard.ts` | `queryFn` unwrap |
| Dashboard UI | `app/(protected)/admin/configuration-dashboard/page.tsx` | `ConfigurationDashboardPage` |
| Normalization | `lib/utils/normalization.ts` | `normalizeNaturalKey`, `sectionNaturalKey`, `sectionDocId` |
| Base Repository | `repositories/base.repository.ts` | `create`, `bulkSetWithIds`, `findAll` |

---

## 3. Firestore Collections

| Collection | Purpose | Tenant Scoped | Natural Key |
|---|---|---|---|
| `tenants/{tid}/settings/config` | Master configuration document | Yes | docId = `config` |
| `academicYears` | Operational academic year records | Yes | `(tenantId, name)` |
| `sections` | Class/section operational records | Yes | `(tenantId, classGrade, sectionName)` |
| `departments` | Department operational records | Yes | `(tenantId, name)` |

---

## 4. Academic Year Evidence

**Status:** VERIFIED (in-memory Firestore)

- **Exists:** Yes — one academic year created per tenant after first publish
- **Tenant ID:** Correct — `tenantId` matches the publishing tenant
- **Name:** Correct — format `${currentYear}-${currentYear + 1}`
- **ID:** Deterministic — returned by `createIfAbsentByName` and linked to `config.metadata.academicYearId`
- **Configuration Linkage:** Yes — `newConfig.metadata.academicYearId` set to provisioning result before save
- **Current Flag:** Yes — newly created AY has `isCurrent: true`

---

## 5. Section Evidence

**Status:** VERIFIED (in-memory Firestore)

- **Expected Number:** Yes — `classes.length * sectionNames.length` sections created
- **Tenant ID:** Correct — all sections carry the provisioning tenantId
- **Class Grade:** Correct — derived from `config.academic.classes[*].name`
- **Section Name:** Correct — derived from `config.academic.sectionNames`
- **Normalized Identity:** Yes — `sectionNaturalKey` and `sectionDocId` use `trim().toLowerCase()`
- **No Duplicates:** Yes — `createMissingSections` computes existing keys and writes only missing docs
- **Soft-Delete Safety:** Yes — existing soft-deleted sections are never resurrected
- **Field Ownership:** Yes — `subjects` initialized only on genuinely new sections

---

## 6. Department Evidence

**Status:** VERIFIED (in-memory Firestore)

- **Expected Number:** Yes — one department per entry in `config.academic.departments`
- **Tenant ID:** Correct — all departments carry the provisioning tenantId
- **Normalized Identity:** Yes — `normalizeNaturalKey(name)` prevents case/whitespace duplicates
- **No Duplicates:** Yes — `createAbsentByName` reuses existing department on normalized name match

---

## 7. Dashboard Evidence

**Status:** PARTIALLY VERIFIED (in-memory Firestore)

- **Academic Year Count:** Correct — `academicYearCount === 1`
- **Class/Section Count:** Correct — `configuredClasses` = distinct `classGrade` count (2); `configuredSections` = section document count (4)
- **Staff/Student Counts:** Correct — `configuredTeachers === 0`, `configuredStudents === 0` (no staff/students provisioned by configuration wizard)
- **Configuration Completion:** Correct — `percentage > 0`, `completed > 0`, computed from real repository counts
- **School Info:** Correct — `schoolInfo.name` matches published configuration

**Note:** Dashboard completion does not reach 100% because the configuration wizard does not provision staff or students. This is expected behavior; completion reflects the operational master data present after provisioning.

---

## 8. Idempotency Evidence

**Status:** VERIFIED (in-memory Firestore)

- **No Duplicate Academic Year:** Yes — second publish reuses existing current AY
- **No Duplicate Sections:** Yes — second publish creates 0 new sections
- **No Duplicate Departments:** Yes — second publish creates 0 new departments
- **No Soft-Deleted Resurrection:** Yes — soft-deleted sections remain `deleted: true` after re-publish
- **Deterministic IDs Stable:** Yes — `sectionDocId` produces same ID across runs
- **Counts Stable:** Yes — section and department counts do not increase on re-publish

---

## 9. Tenant Isolation Evidence

**Status:** VERIFIED (in-memory Firestore)

- **Tenant A cannot see Tenant B records:** Yes — all repository queries filter by `tenantId`
- **Tenant B cannot see Tenant A records:** Yes — all repository queries filter by `tenantId`
- **Dashboard Isolation:** Yes — `getDashboardMetrics("tenant-iso-a")` returns only A's metrics; same for B

---

## 10. API Response Evidence

**Status:** VERIFIED (source trace + in-memory Firestore)

- **API Response Envelope:** `createSuccessResponse(metrics)` returns `{ success: true, data: metrics, ... }`
- **Hook Unwrap:** `useConfigurationDashboard` uses `res?.data?.data ?? res?.data` then `safeObject(payload)`
- **UI Consumption:** `ConfigurationDashboardPage` reads `data?.schoolInfo`, `data?.configuredSections`, etc. on the unwrapped payload
- **No `data.data` mismatch:** Verified — hook unwraps one level; UI reads direct properties
- **No fake zero fallback:** Verified — dashboard service reads from real repositories
- **No stale cache:** Verified — cache is invalidated after successful provisioning

**Previous Fix Distinction:** The hook response-envelope remediation was completed in commit `6efeed8`. The current verification addresses configuration provisioning / operational master-data integration.

---

## 11. Test Results

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | PASS |
| Lint | `npm run lint` | PASS with 2 pre-existing warnings |
| Tests | `npm test -- --runInBand` | PASS — 75 suites, 774 tests |
| Build | `npm run build` | PASS with Sentry transitive-dependency warning |

**New Integration Test:** `__tests__/services/configuration-provisioning.e2e.integration.test.ts`
- STEP 2: Complete Save → Provision → Firestore → Dashboard READ path — PASS
- STEP 3: Idempotency — re-publish produces no duplicates — PASS
- STEP 4: Tenant isolation — Tenant A cannot see Tenant B records — PASS
- STEP 5: API response contract — hook consumes exact API response shape — PASS

---

## 12. Remaining Limitations

| Limitation | Status |
|---|---|
| Live Firebase Auth/Firestore execution | UNVERIFIED — in-memory Firestore used |
| Firestore security rules validation | UNVERIFIED |
| Firestore composite indexes validation | UNVERIFIED |
| Real browser form submission and session | UNVERIFIED |
| Staff/student provisioning beyond wizard | UNVERIFIED — wizard does not provision staff/students |
| Exam/fee-structure/invoice lifecycle | UNVERIFIED — out of scope for configuration provisioning |
| External webhook/event delivery (QStash) | UNVERIFIED |
| Cache invalidation timing against live Redis/Upstash | UNVERIFIED |

---

## Final Result

| Check | Status |
|---|---|
| CONFIGURATION INTEGRATION | PASS |
| FIRESTORE PERSISTENCE | PARTIALLY VERIFIED (in-memory Firestore; live Firebase UNVERIFIED) |
| DASHBOARD READ | PARTIALLY VERIFIED (in-memory Firestore; live Firebase UNVERIFIED) |
| IDEMPOTENCY | PASS |
| TENANT ISOLATION | PASS |
| RESPONSE CONTRACT | PASS |
| TSC | PASS |
| LINT | PASS |
| TESTS | PASS |
| BUILD | PASS |
