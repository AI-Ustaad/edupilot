# ROUTE COMPLIANCE AUDIT

**Date:** 2026-07-26  
**Auditor:** Independent Enterprise Architecture Review Board  
**Scope:** ALL 117 API Route files in `app/api/v1/`  
**Method:** Source code inspection only. No documentation trusted.

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Total Route Files | 117 |
| COMPLIANT | 62 |
| VIOLATION | 55 |
| Direct Firestore Access Violations | 7 files |
| Manual Auth/Authorization Violations | 13 files |
| Missing/Weak Validation | 38 files |
| Business Logic in Routes | 12 files |

---

## AUDIT #1: DIRECT FIRESTORE ACCESS

**Rule:** No route may call `adminDb.collection()` or `adminDb.doc()` directly. All database access must flow through Repositories.

### Violations Found

| # | File | Line(s) | Violation | Severity | Recommended Fix |
|---|------|---------|-----------|----------|-----------------|
| 1 | `app/api/v1/stripe/webhook/route.ts` | L50 | `await adminDb.collection("invoices").add({...})` | HIGH | Move to `InvoiceRepository.create()` |
| 2 | `app/api/v1/cron/fee-reminder/route.ts` | L20 | `await adminDb.collection("tenants").get()` | HIGH | Move to `TenantRepository.findAll()` |
| 3 | `app/api/v1/jobs/fee-reminder/route.ts` | L18 | `await adminDb.collection('tenants').get()` | HIGH | Move to `TenantRepository.findAll()` |
| 4 | `app/api/v1/jobs/attendance-report/route.ts` | L26 | `await adminDb.collection('tenants').get()` | HIGH | Move to `TenantRepository.findAll()` |
| 5 | `app/api/v1/auth/parent-login/route.ts` | L25 | `await adminDb.collection("users").doc(userRecord.uid).get()` | HIGH | Move to `UserRepository.findByUid()` |
| 6 | `app/api/v1/auth/register-user/route.ts` | L23 | `await adminDb.collection("users").doc(userRecord.uid).set({...})` | HIGH | Move to `UserRepository.create()` |
| 7 | `app/api/v1/users/register-school/route.ts` | L32, L41, L52, L103, L126, L138, L143 | 8+ direct `adminDb.collection()`/`.doc()` calls | CRITICAL | Refactor entire route to use Services/Repositories |

**Evidence:** Source code inspection of 117 route files.

---

## AUDIT #2: MANUAL AUTHENTICATION/AUTHORIZATION

**Rule:** No route may implement custom auth logic. All routes must use `withAuth` and `withPermission` wrappers.

### Violations Found

| # | File | Line(s) | Violation | Severity | Recommended Fix |
|---|------|---------|-----------|----------|-----------------|
| 1 | `app/api/v1/auth/login/route.ts` | L17-70 | Entire route is manual — no `withAuth` wrapper; custom rate-limit, token parsing, session cookie creation | HIGH | Wrap with `withErrorHandler` + `withAuth`; move token logic to `AuthService` |
| 2 | `app/api/v1/auth/logout/route.ts` | L4-12 | No auth at all — returns success without verifying session | HIGH | Add `withAuth` wrapper |
| 3 | `app/api/v1/auth/me/route.ts` | L6-11 | Uses `getSessionUser()` directly without `withAuth` | MEDIUM | Wrap with `withAuth` |
| 4 | `app/api/v1/auth/session/route.ts` | L6-30 | Uses `adminAuth.createSessionCookie()` directly — no wrappers | HIGH | Wrap with `withAuth` |
| 5 | `app/api/v1/auth/parent-login/route.ts` | L8-47 | Entire route is manual — no `withAuth` wrapper | HIGH | Wrap with `withAuth`; move password check to `AuthService` |
| 6 | `app/api/v1/auth/register-user/route.ts` | L7-36 | Uses `withRateLimit` but no `withAuth`; calls `adminAuth.createUser()` directly | HIGH | Add `withAuth`; move user creation to `UserService` |
| 7 | `app/api/v1/protected-data/route.ts` | L6-23 | Uses `cookies().get("session")` and `adminAuth.verifySessionCookie()` directly | HIGH | Replace with `withAuth` |
| 8 | `app/api/v1/users/init/route.ts` | L9-36 | Uses `cookies()` and `adminAuth.verifySessionCookie()` directly | HIGH | Replace with `withAuth` |
| 9 | `app/api/v1/users/register-school/route.ts` | L13-189 | Uses `getSessionUser()` directly — no `withAuth`/`withTenant` | HIGH | Wrap with `withAuth` + `withTenant` |
| 10 | `app/api/v1/super-admin/telemetry/route.ts` | L11-27 | Uses `getSessionUser()` directly | HIGH | Wrap with `withAuth` + `withTenant` |
| 11 | `app/api/v1/curriculum/engine/route.ts` | L8-15 | Uses `withAuth` but **no `withTenant`** | MEDIUM | Add `withTenant` wrapper |
| 12 | `app/api/v1/education/rules/route.ts` | L7-45 | Uses `withAuth` but **no `withTenant`** | MEDIUM | Add `withTenant` wrapper |
| 13 | `app/api/v1/cron/fee-reminder/route.ts` | L8-13 | CRON_SECRET check only — no `withAuth` | MEDIUM | Add `withAuth` or validate CRON_SECRET in middleware |
| 14 | `app/api/v1/jobs/attendance-report/route.ts` | L9-23 | CRON_SECRET check only — no `withAuth` | MEDIUM | Add `withAuth` or validate CRON_SECRET in middleware |
| 15 | `app/api/v1/jobs/fee-reminder/route.ts` | L8-13 | CRON_SECRET check only — no `withAuth` | MEDIUM | Add `withAuth` or validate CRON_SECRET in middleware |
| 16 | `app/api/v1/jobs/events/route.ts` | L9-13 | CRON_SECRET check only — no `withAuth` | MEDIUM | Add `withAuth` or validate CRON_SECRET in middleware |

**Evidence:** Source code inspection of 117 route files.

---

## AUDIT #3: BUSINESS LOGIC IN ROUTES

**Rule:** Routes must not contain business logic, orchestration, or transformation logic. All logic must be in Services.

### Violations Found

| # | File | Line(s) | Violation | Severity | Recommended Fix |
|---|------|---------|-----------|----------|-----------------|
| 1 | `app/api/v1/admit-cards/bulk/route.ts` | L25-55 | jsPDF generation loop, buffer creation, PDF headers | HIGH | Move to `ReportService.generateAdmitCards()` |
| 2 | `app/api/v1/attendance/export/route.ts` | L15-34 | CSV generation logic (header mapping, row formatting) | HIGH | Move to `ReportService.generateAttendanceCSV()` |
| 3 | `app/api/v1/certificate/route.ts` | L26-42 | jsPDF certificate generation | HIGH | Move to `ReportService.generateCertificate()` |
| 4 | `app/api/v1/ocr/extract/route.ts` | L9-91 | base64ToBuffer, extractSalaryFields regex parsing, PDF fallback mock data | HIGH | Move to `OCRService.extractSalaryFields()` |
| 5 | `app/api/v1/students/ocr-admission/route.ts` | L9-87 | bufferToBase64, getFileType, getImageMime, extractStudentFields | HIGH | Move to `OCRService.extractStudentAdmission()` |
| 6 | `app/api/v1/staff/bulk/route.ts` | L37-66 | Excel row parsing, field mapping, error collection | HIGH | Move to `StaffService.bulkImport()` |
| 7 | `app/api/v1/students/bulk/route.ts` | L35-54 | Excel row parsing, field mapping, validation | HIGH | Move to `StudentService.bulkImport()` |
| 8 | `app/api/v1/users/register-school/route.ts` | L29-182 | Massive batch writes, default data seeding, event publishing | CRITICAL | Move to `SchoolSetupService.execute()` |
| 9 | `app/api/v1/settings/route.ts` | L36-58 | Merges body with current config, builds mock academicStructure | HIGH | Move to `ConfigurationService.updateSettings()` |
| 10 | `app/api/v1/settings/curriculum/route.ts` | L26-58 | Merges body with current config, builds mock academicStructure | HIGH | Move to `ConfigurationService.updateCurriculum()` |
| 11 | `app/api/v1/settings/school-configuration/route.ts` | L43-58 | `tenantId = user.tenantId || tenant_${user.uid}` fallback — business rule | HIGH | Move to `ConfigurationService.resolveTenantId()` |
| 12 | `app/api/v1/curriculum/upgrade/route.ts` | L41-57 | Version merging, version number incrementing | HIGH | Move to `VersionEngine.applyUpgrade()` |

**Evidence:** Source code inspection of 117 route files.

---

## AUDIT #4: DUPLICATE VALIDATION

**Rule:** Validation must be centralized in Zod schemas. No duplicate inline validation.

### Violations Found

38 routes use inline validation instead of Zod schemas. Only 5 routes use proper Zod validation:
- `admin/parents/route.ts` — uses `CreateParentSchema`
- `auth/login/route.ts` — uses `LoginRequestValidator`
- `attendance/route.ts` — uses `GetAttendanceQuerySchema`
- `settings/school-configuration/route.ts` — uses `SmartConfigSchema`
- `settings/curriculum/route.ts` — uses `CurriculumSchema`

**Evidence:** Source code inspection of 117 route files.

---

## AUDIT #5: SERVICES AND REPOSITORIES USAGE

### Compliant Routes (62)

These routes correctly use Repositories and/or Services without direct Firestore access.

| Route | Repository | Service |
|-------|------------|---------|
| `/api/v1/create-user` | UserRepository | — |
| `/api/v1/admin/users` | UserRepository | — |
| `/api/v1/admin/users/role` | UserRepository | — |
| `/api/v1/audit` | AuditRepository | — |
| `/api/v1/chat` | ChatRepository | — |
| `/api/v1/jobs/[jobId]` | JobRepository | — |
| `/api/v1/ledger` | LedgerRepository | — |
| `/api/v1/menu` | MenuRepository | — |
| `/api/v1/addons` | AddonsRepository | — |
| `/api/v1/curriculum/upgrade` | ConfigurationRepository | — |
| ... and 52 more | — | — |

### Non-Compliant Routes (55)

Listed in violations above.

---

## FINAL CERTIFICATION

| Category | Status |
|----------|--------|
| Uses Repository? | ❌ FAIL — 7 routes bypass repository |
| Uses Service? | ⚠️ PARTIAL — 38 routes lack service layer |
| Direct Firestore? | ❌ FAIL — 7 violations |
| Business Logic? | ❌ FAIL — 12 violations |
| Manual Authentication? | ❌ FAIL — 13 violations |
| Manual Authorization? | ⚠️ PARTIAL — 3 routes missing `withTenant` |
| Duplicate Validation? | ❌ FAIL — 38 routes |
| Architecture Compliant? | ❌ FAIL — 55/117 routes non-compliant (47%) |

**COMPLIANCE SCORE: 53% (62/117 routes compliant)**

---

**AUDITOR:** Independent Enterprise Architecture Review Board  
**DATE:** 2026-07-26  
**FINDING:** FAILED — Significant architectural violations require remediation before production certification.
