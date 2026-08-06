# Configuration Dashboard Runtime Audit

**Audit Date:** 2026-08-05
**Auditor:** Enterprise Debugging Board
**Scope:** Complete request lifecycle from UI component to Firestore
**Status:** TRACE ONLY — NO CODE MODIFICATIONS

---

## Executive Summary

The Configuration Dashboard renders with School Name = N/A, Academic Years = 0, Classes = 0, Teachers = 0, Students = 0, Completion = 0%. The root cause is a **response unwrapping mismatch** between the API layer and the hook layer, compounded by hardcoded zero values in the service layer for several metrics.

---

## Layer 1: UI Component (Page)

**File:** `app/(protected)/admin/configuration-dashboard/page.tsx`

| Field | Value |
|---|---|
| **Input** | `data` from `useConfigurationDashboard()` hook |
| **Output** | Rendered dashboard with metrics, school info, completion bar, module grid |
| **Returned Object** | JSX elements with metric cards and status indicators |
| **Missing Fields** | N/A (UI renders correctly when data is present) |
| **Tenant ID** | Derived from `useAuth()` → `user?.tenantId || "unknown"` (line 42) |
| **Query Executed** | None (render-only component) |
| **Firestore Collection** | N/A |
| **Repository Called** | N/A |
| **Service Method** | N/A |
| **API Response** | N/A |
| **UI Mapping** | Lines 63–64: `data?.configurationCompletion \|\| fallback` and `data?.schoolInfo \|\| {}` |
| **Runtime Evidence** | `data?.configurationCompletion` resolves to `{ percentage: 0, total: 0, completed: 0, missing: [] }` because `data` lacks the expected keys. `data?.schoolInfo` resolves to `{}`, so `schoolInfo.name` is `undefined` → renders "N/A". All `data?.academicYearCount \|\| 0` evaluate to `0`. |
| **Root Cause** | `data` is the API envelope `{ success, message, data: metrics, ... }`, not the metrics object. The page accesses `data.configurationCompletion` but the actual value is at `data.data.configurationCompletion`. |

---

## Layer 2: Hook

**File:** `hooks/useConfigurationDashboard.ts`

| Field | Value |
|---|---|
| **Input** | `tenantId` from `useAuth()` → `user?.tenantId` |
| **Output** | `{ data, isLoading, error, refetch }` from `useQuery` |
| **Returned Object** | `safeObject(res)` where `res` is the axios response |
| **Missing Fields** | The `data` field of the API envelope is not unwrapped to extract the metrics payload |
| **Tenant ID** | `user?.tenantId || "unknown"` (line 10) |
| **Query Executed** | `GET /api/v1/configuration/dashboard` (line 15) |
| **Firestore Collection** | N/A (HTTP call) |
| **Repository Called** | N/A |
| **Service Method** | N/A |
| **API Response** | Raw axios Response object |
| **UI Mapping** | `data` returned by hook is passed directly to page as `data` prop |
| **Runtime Evidence** | `safeObject(res)` at line 16 extracts `res.data` (the JSON body), which is `{ success: true, message: "Success", data: { ...metrics }, errors: null, meta: null, traceId: "...", timestamp: "..." }`. The hook returns this envelope object as-is. The page then accesses `data?.configurationCompletion` on this envelope, which is `undefined`. |
| **Root Cause** | `safeObject` unwraps the axios response (`res.data`) but does NOT unwrap the API envelope (`{ success, data: payload, ... }`). The hook should return `safeObject(res).data` or use `unwrapApiResponse(res)` to extract the actual metrics payload. Compare with `useSchool.ts` which has the same pattern and same bug. |

---

## Layer 3: API Route Handler

**File:** `app/api/v1/configuration/dashboard/route.ts`

| Field | Value |
|---|---|
| **Input** | `Request` object, `TenantContext` from middleware chain |
| **Output** | `NextResponse` with JSON body `{ success: true, message: "Success", data: metrics, ... }` |
| **Returned Object** | `createSuccessResponse(metrics)` |
| **Missing Fields** | N/A (API correctly wraps and returns metrics) |
| **Tenant ID** | `context.tenantId` from `withTenant` middleware (line 10) |
| **Query Executed** | None (delegates to service) |
| **Firestore Collection** | N/A |
| **Repository Called** | N/A |
| **Service Method** | `configurationDashboardService.getDashboardMetrics(tenantId)` (line 11) |
| **API Response** | `{ success: true, message: "Success", data: ConfigurationDashboardMetrics, errors: null, meta: null, traceId: "trace_...", timestamp: "..." }` |
| **UI Mapping** | The `data` field in this JSON body is the `ConfigurationDashboardMetrics` object |
| **Runtime Evidence** | The route handler correctly calls `getDashboardMetrics(tenantId)` and wraps the result with `createSuccessResponse(metrics)`. The response JSON structure is correct. The issue is downstream — the hook does not unwrap the `data` field from this envelope. |
| **Root Cause** | No root cause at this layer. The API route functions correctly. |

---

## Layer 3b: Middleware Chain

**Files:** `route-helpers/withAuth.ts`, `route-helpers/withTenant.ts`, `route-helpers/withErrorHandler.ts`

| Field | Value |
|---|---|
| **withAuth** | Calls `getSessionUser()` → reads `session` cookie → verifies with Firebase Auth → looks up user doc in `users` collection → returns `{ uid, email, role, tenantId, onboardingRequired }` |
| **withTenant** | Calls `tenantResolver.resolve({ user })` → if `user.tenantId` is non-empty, uses it directly; otherwise derives from UID via hash → sets `context.tenantId` |
| **withErrorHandler** | Catches any thrown error and returns a 500 JSON response |
| **Execution Order** | `withErrorHandler` → `withAuth` → `withTenant` → handler |
| **Tenant ID Flow** | Firestore `users` doc → `user.tenantId` → `context.tenantId` → `getDashboardMetrics(tenantId)` |
| **Runtime Evidence** | If `user.tenantId` is `null` (missing from Firestore `users` doc), `tenantResolver` derives a tenant ID from `uid` via `deriveTenantId()`. If `tenantId` ends up as `"unknown"`, the hook's `enabled` flag becomes `false` and the query never fires. |
| **Root Cause** | If the user document in Firestore lacks a `tenantId` field, the derived tenant ID may not match any existing tenant documents, causing all queries to return empty results. |

---

## Layer 4: Service

**File:** `services/configuration-dashboard.service.ts`

| Field | Value |
|---|---|
| **Input** | `tenantId: string` |
| **Output** | `ConfigurationDashboardMetrics` object |
| **Returned Object** | Object with `schoolInfo`, `academicYearCount`, `configuredClasses`, `configuredSections`, `configuredSubjects`, `configuredTeachers`, `configuredStaff`, `configuredStudents`, `configuredParents`, `configuredRooms`, `configuredBuildings`, `configuredFacilities`, `libraryStatus`, `transportStatus`, `hostelStatus`, `feeConfiguration`, `configurationCompletion`, `warnings`, `missingConfigurations`, `totalCount`, `completedCount` |
| **Missing Fields** | `schoolInfo` is `null` when config doc is missing; `configuredSubjects`, `configuredRooms`, `configuredBuildings`, `configuredFacilities` are hardcoded to 0 |
| **Tenant ID** | Passed through from API route |
| **Query Executed** | `Promise.all([configurationRepo.getConfiguration(tenantId), getCounts(tenantId)])` then `calcCompletion()` |
| **Firestore Collection** | `tenants/{tenantId}/settings/config` (via ConfigurationRepository) |
| **Repository Called** | `ConfigurationRepository.getConfiguration()`, `AcademicYearRepository.findAllByTenant()`, `ClassRepository.getAll()`, `SectionRepository.findAllActive()`, `StudentRepository.count()`, `StaffRepository.findAll()`, `ParentsRepository.findAll()` |
| **Service Method** | `getDashboardMetrics(tenantId)` → calls `getCounts(tenantId)` → calls `calcCompletion(tenantId, config, counts)` |
| **API Response** | N/A (service returns domain object, not HTTP response) |
| **UI Mapping** | The returned `ConfigurationDashboardMetrics` object is what the API route wraps in `createSuccessResponse()` |
| **Runtime Evidence** | `getCounts()` (lines 76–132) fires 6 parallel repository calls. `StudentRepository.count()` returns a number. `StaffRepository.findAll()` and `ParentsRepository.findAll()` return arrays. `AcademicYearRepository.findAllByTenant()` returns an array. `ClassRepository.getAll()` and `SectionRepository.findAllActive()` both query the `sections` collection. Lines 120–131 hardcode `rooms: 0`, `buildings: 0`, `facilities: 0`, `library: 0`, `transport: 0`, `hostel: 0`, `feeStructure: 0`. |
| **Root Cause** | (1) `getCounts()` hardcodes 7 metrics to zero — these will never be populated from Firestore. (2) `ClassRepository.getAll()` and `SectionRepository.findAllActive()` both query the same `sections` collection, so class and section counts are derived from identical data. (3) If `ConfigurationRepository.getConfiguration()` returns null (no config doc), `schoolInfo` is null and `configuredSubjects` is 0. |

---

## Layer 5: Repositories

### 5a. ConfigurationRepository

| Field | Value |
|---|---|
| **File** | `repositories/configuration.repository.ts` |
| **Method** | `getConfiguration(tenantId)` |
| **Input** | `tenantId: string` |
| **Output** | `MasterSchoolConfiguration | null` |
| **Firestore Collection** | `tenants/{tenantId}/settings` subcollection, document `config` (`CONFIGURATION_DOC_ID`) |
| **Query** | `adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config").get()` |
| **Mapper** | `mapToMasterConfiguration(doc.data(), tenantId)` from `lib/mappers/configuration.mapper.ts` |
| **Runtime Evidence** | If the document does not exist at `tenants/{tenantId}/settings/config`, returns `null`. The mapper handles both legacy and master format documents. For legacy documents, it maps `legacy.school.name` to `config.school.name`. |
| **Root Cause** | If no configuration document exists for this tenant, `config` is null → `schoolInfo` is null → School Name = N/A, Board = N/A, Country = N/A. |

### 5b. AcademicYearRepository

| Field | Value |
|---|---|
| **File** | `repositories/academic-year.repository.ts` |
| **Method** | `findAllByTenant(tenantId)` |
| **Input** | `tenantId: string` |
| **Output** | `(AcademicYear & { id: string })[]` |
| **Firestore Collection** | `academicYears` (top-level collection) |
| **Query** | `.collection("academicYears").where("tenantId", "==", tenantId).orderBy("startDate", "desc").get()` |
| **Runtime Evidence** | Returns all academic year documents for the tenant. The count (`academicYear.length`) drives the Academic Years metric. |
| **Root Cause** | If no documents exist in `academicYears` for this tenantId, returns empty array → count = 0. |

### 5c. ClassRepository

| Field | Value |
|---|---|
| **File** | `repositories/class.repository.ts` |
| **Method** | `getAll(tenantId)` |
| **Input** | `tenantId: string` |
| **Output** | `(ClassRecord & { id: string })[]` |
| **Firestore Collection** | `sections` (top-level collection) |
| **Query** | `.collection("sections").where("tenantId", "==", tenantId).get()` then `.filter(r => !r.deleted)` |
| **Runtime Evidence** | Queries the `sections` collection and filters out soft-deleted records. The count drives the Classes metric. |
| **Root Cause** | (1) Uses `sections` collection — same collection as SectionRepository. (2) If no non-deleted documents exist for this tenantId, returns empty array → count = 0. |

### 5d. SectionRepository

| Field | Value |
|---|---|
| **File** | `repositories/section.repository.ts` |
| **Method** | `findAllActive(tenantId)` |
| **Input** | `tenantId: string` |
| **Output** | `(Section & { id: string })[]` |
| **Firestore Collection** | `sections` (top-level collection) |
| **Query** | `.collection("sections").where("tenantId", "==", tenantId).get()` then `.filter(s => !s.deleted)` |
| **Runtime Evidence** | Queries the same `sections` collection as ClassRepository. The count drives the Sections metric. |
| **Root Cause** | (1) Same collection as ClassRepository — both `counts.classes` and `counts.sections` derive from identical Firestore data. (2) If no non-deleted documents exist, returns empty array → count = 0. |

### 5e. StudentRepository

| Field | Value |
|---|---|
| **File** | `repositories/student.repository.ts` |
| **Method** | `count(tenantId)` (inherited from BaseRepository) |
| **Input** | `tenantId: string` |
| **Output** | `number` |
| **Firestore Collection** | `students` (top-level collection) |
| **Query** | `.collection("students").where("tenantId", "==", tenantId).count().get()` |
| **Runtime Evidence** | Uses Firestore's `count()` aggregation query. Returns the total count of student documents for this tenant. |
| **Root Cause** | If no student documents exist for this tenantId, returns 0. |

### 5f. StaffRepository

| Field | Value |
|---|---|
| **File** | `repositories/staff.repository.ts` |
| **Method** | `findAll(tenantId)` (inherited from BaseRepository) |
| **Input** | `tenantId: string` |
| **Output** | `(StaffDocument & { id: string })[]` |
| **Firestore Collection** | `staff` (top-level collection) |
| **Query** | `.collection("staff").where("tenantId", "==", tenantId).get()` |
| **Runtime Evidence** | Returns all staff documents for the tenant. The array length drives both `configuredTeachers` and `configuredStaff` metrics (lines 50–51 of service). |
| **Root Cause** | If no staff documents exist for this tenantId, returns empty array → count = 0. |

### 5g. ParentsRepository

| Field | Value |
|---|---|
| **File** | `repositories/parents.repository.ts` |
| **Method** | `findAll(tenantId)` (inherited from BaseRepository) |
| **Input** | `tenantId: string` |
| **Output** | `(ParentDocument & { id: string })[]` |
| **Firestore Collection** | `parents` (top-level collection) |
| **Query** | `.collection("parents").where("tenantId", "==", tenantId).get()` |
| **Runtime Evidence** | Returns all parent documents for the tenant. The array length drives `configuredParents` metric. |
| **Root Cause** | If no parent documents exist for this tenantId, returns empty array → count = 0. |

### 5h. BaseRepository

| Field | Value |
|---|---|
| **File** | `repositories/base.repository.ts` |
| **Method** | `findAll()`, `count()`, `findById()`, `create()`, `update()`, `delete()` |
| **Firestore** | `adminDb` from `@/lib/firebase-admin` |
| **Runtime Evidence** | All tenant-scoped queries use `.where('tenantId', '==', tenantId)`. The `count()` method uses Firestore's `.count().get()` aggregation. The `serializeDoc()` function converts Firestore Timestamps to ISO strings. |

---

## Layer 6: Firestore

| Collection | Document Path | Queried By | Filter |
|---|---|---|---|
| `tenants/{tenantId}/settings/config` | `tenants/{tenantId}/settings/config` | ConfigurationRepository | Document ID = "config" |
| `academicYears` | Top-level | AcademicYearRepository | `tenantId == tenantId` |
| `sections` | Top-level | ClassRepository, SectionRepository | `tenantId == tenantId` |
| `students` | Top-level | StudentRepository | `tenantId == tenantId` |
| `staff` | Top-level | StaffRepository | `tenantId == tenantId` |
| `parents` | Top-level | ParentsRepository | `tenantId == tenantId` |

---

## Complete Request Lifecycle Trace

```
1. Browser renders ConfigurationDashboardPage()
   │
2. useAuth() returns { user } from AuthContext
   │  user.tenantId comes from Firestore `users` doc via getSessionUser()
   │
3. useConfigurationDashboard() hook fires
   │  tenantId = user?.tenantId || "unknown"
   │  enabled = !!tenantId && tenantId !== "unknown"
   │  If enabled=false → query never fires → data=undefined → all fallbacks trigger
   │
4. apiClient.get("/configuration/dashboard") fires
   │  GET /api/v1/configuration/dashboard
   │
5. withErrorHandler → withAuth → withTenant middleware chain
   │  withAuth: verifies session cookie, gets user from Firestore `users` doc
   │  withTenant: resolves tenantId from user.tenantId or derives from uid
   │  context.tenantId is set
   │
6. Route handler calls configurationDashboardService.getDashboardMetrics(tenantId)
   │
7. Service fires Promise.all([
   │    configurationRepo.getConfiguration(tenantId),   → tenants/{tenantId}/settings/config
   │    getCounts(tenantId)                             → 6 parallel repo calls
   │  ])
   │
8. getCounts() fires:
   │  - academicYearRepo.findAllByTenant(tenantId)  → academicYears collection
   │  - classRepo.getAll(tenantId)                   → sections collection
   │  - sectionRepo.findAllActive(tenantId)          → sections collection
   │  - studentRepo.count(tenantId)                  → students collection (count agg)
   │  - staffRepo.findAll(tenantId)                  → staff collection
   │  - parentRepo.findAll(tenantId)                 → parents collection
   │
9. Service calculates calcCompletion() using counts and config
   │  20 checks total; each check requires non-zero count or config field
   │  Hardcoded zeros (rooms, buildings, facilities, library, transport, hostel, feeStructure) always fail
   │
10. Service returns ConfigurationDashboardMetrics object
    │
11. API route wraps with createSuccessResponse(metrics)
    │  Response body: { success: true, message: "Success", data: metrics, ... }
    │
12. axios receives Response object
    │  res.data = { success: true, message: "Success", data: metrics, ... }
    │
13. Hook calls safeObject(res)
    │  Returns res.data = { success: true, message: "Success", data: metrics, ... }
    │  ⚠ DOES NOT unwrap the `data` field from the envelope
    │
14. Hook returns the envelope object as `data`
    │
15. Page accesses data?.configurationCompletion → undefined (falls back to 0)
    │  Page accesses data?.schoolInfo → undefined (falls back to {})
    │  Page accesses data?.academicYearCount → undefined (falls back to 0)
    │  ... all metrics same
```

---

## Root Cause Analysis

### PRIMARY ROOT CAUSE: Response Envelope Not Unwrapped by Hook

The `useConfigurationDashboard` hook at `hooks/useConfigurationDashboard.ts:16` calls `safeObject(res)` which extracts the axios response body (`res.data`), but the API route wraps the metrics in a `createSuccessResponse()` envelope:

```json
{
  "success": true,
  "message": "Success",
  "data": { "schoolInfo": {...}, "academicYearCount": 5, ... },
  "errors": null,
  "meta": null,
  "traceId": "...",
  "timestamp": "..."
}
```

The hook returns this envelope as-is. The page then accesses `data?.configurationCompletion` on the envelope, which is `undefined`. Every field access falls back to the default values (0, "N/A", empty array).

**The fix would be** to unwrap one more level in the hook:
```typescript
return safeObject(res)?.data ?? safeObject(res);
```
or use the existing `unwrapApiResponse` utility.

### SECONDARY ROOT CAUSE: Hardcoded Zero Metrics in Service

In `services/configuration-dashboard.service.ts:120–131`, seven metrics are hardcoded to zero:
- `rooms: 0`
- `buildings: 0`
- `facilities: 0`
- `library: 0`
- `transport: 0`
- `hostel: 0`
- `feeStructure: 0`

These have no repository calls and no Firestore queries. Even if the response unwrapping were fixed, these fields would always be zero, and the corresponding completion checks would always fail.

### TERTIARY ROOT CAUSE: ClassRepository and SectionRepository Share Same Collection

Both `ClassRepository` and `SectionRepository` query the `sections` Firestore collection with identical filters (`tenantId` + `!deleted`). This means `counts.classes` and `counts.sections` always return the same value, which is likely incorrect if classes and sections are meant to be distinct entities.

### QUATERNARY ROOT CAUSE: Tenant ID Resolution Dependency

The entire chain depends on `user.tenantId` being set in the Firestore `users` document. If the user document lacks `tenantId`:
1. `tenantResolver` derives a tenant ID from the UID hash
2. The derived ID may not match any existing tenant data in Firestore
3. All queries return empty results → all counts are zero
4. The configuration document at `tenants/{derivedId}/settings/config` does not exist → `schoolInfo` is null

---

## Per-Metric Trace Summary

| Metric | UI Field | Data Path | Firestore Collection | Repository Method | Why Zero/N/A |
|---|---|---|---|---|---|
| School Name | `schoolInfo.name \|\| "N/A"` | `data.data.schoolInfo.name` | `tenants/{tid}/settings/config` | `ConfigurationRepository.getConfiguration()` | Config doc missing OR hook doesn't unwrap envelope |
| Academic Years | `data?.academicYearCount \|\| 0` | `data.data.academicYearCount` | `academicYears` | `AcademicYearRepository.findAllByTenant()` | No docs for tenant OR hook doesn't unwrap |
| Classes | `data?.configuredClasses \|\| 0` | `data.data.configuredClasses` | `sections` | `ClassRepository.getAll()` | No docs for tenant OR hook doesn't unwrap |
| Teachers | `data?.configuredTeachers \|\| 0` | `data.data.configuredTeachers` | `staff` | `StaffRepository.findAll()` | No docs for tenant OR hook doesn't unwrap |
| Students | `data?.configuredStudents \|\| 0` | `data.data.configuredStudents` | `students` | `StudentRepository.count()` | No docs for tenant OR hook doesn't unwrap |
| Completion | `completion.percentage \|\| 0` | `data.data.configurationCompletion.percentage` | Multiple | `calcCompletion()` | All checks fail due to zero counts OR hook doesn't unwrap |

---

## Runtime Evidence Summary

1. **Hook returns API envelope, not metrics payload** — `safeObject(res)` at `hooks/useConfigurationDashboard.ts:16` returns `{ success, message, data: metrics, ... }` instead of `metrics` directly.

2. **Page accesses wrong object level** — `page.tsx:63` accesses `data?.configurationCompletion` but the value is at `data?.data?.configurationCompletion`.

3. **All 7 hardcoded zero metrics** — `services/configuration-dashboard.service.ts:120–131` set `rooms`, `buildings`, `facilities`, `library`, `transport`, `hostel`, `feeStructure` to `0` with no repository calls.

4. **Class and Section share collection** — Both `ClassRepository` and `SectionRepository` query the `sections` Firestore collection, producing identical counts.

5. **Tenant ID chain** — Depends on `users` document in Firestore having a `tenantId` field. If absent, a derived ID is used which may not match existing tenant data.

---

*End of Audit — No code modifications were made.*
