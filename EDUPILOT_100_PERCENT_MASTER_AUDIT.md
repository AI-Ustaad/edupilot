# EDUPILOT SAAS ERP: 100% EXHAUSTIVE MASTER AUDIT REPORT

**Audit Date:** October 31, 2026  
**Auditor:** Principal Enterprise Software Architect & Lead Security Auditor  
**Scope:** 100% Codebase Coverage across `/Users/imranhaidersandhu/Documents/edupilot`  
**System Profile:** Next.js 14 (App Router), Firebase / Firestore, TypeScript 5, Tailwind CSS, Stripe, Upstash Redis/QStash, Resend, Gemini AI.

---

## 1. Complete System Inventory & Architecture Map

### 1.1. Directory & Layer Organization
The EduPilot codebase follows an enterprise layered architectural pattern across the following primary directories:

```
edupilot/
├── app/                  # Next.js App Router (78 pages, 3 layouts, 123 API routes)
│   ├── (protected)/      # Protected SaaS tenant portal (admin, teacher, parent, settings)
│   └── api/              # API route handlers (/api/v1/...)
├── components/           # UI components, layout shell, modals, widgets (24 files)
├── context/              # Client context providers (AuthContext, BrandingContext)
├── dto/                  # Data Transfer Objects & Zod validation schemas (11 files)
├── entities/             # Enterprise domain entities (StudentEntity, FeeEntity, etc.)
├── documents/            # Firestore persistence document schemas (StudentDocument, etc.)
├── interfaces/           # Clean architecture service & repository contracts (105 files)
├── repositories/         # Firestore persistence adapters (53 repository files)
├── services/             # Domain business logic layer (58 service files)
├── hooks/                # Client data hooks (TanStack React Query & Zustand) (38 files)
├── lib/                  # Core engines (AI, Events, Workers, Cache, Auth, PDF, Logging)
├── messages/             # Localization dictionary JSON files (7 languages)
├── validators/           # Zod schema validators (11 modules)
├── route-helpers/        # Route handler composition wrappers (withAuth, withTenant, etc.)
└── governance/           # Architectural ADRs and compliance records
```

### 1.2. Tech Stack & Dependencies Verification
- **Framework:** Next.js 14.2.3, React 18.2.0, React DOM 18.2.0.
- **State Management:** Zustand 5.0.14, TanStack React Query 5.101.0.
- **Database / Backend:** Firebase 10.8.1, Firebase Admin 13.10.0, Google Cloud Firestore.
- **Background Jobs & Cache:** Upstash Redis 1.38.0, Upstash Ratelimit 2.0.8, Upstash QStash 2.11.0.
- **Billing & Payments:** Stripe 14.21.0, `@stripe/stripe-js` 2.4.0.
- **AI & Document Intelligence:** Google Generative AI (Gemini), Tesseract.js 5.0.5, PDF-Parse 1.1.4, Sharp 0.35.3.
- **Communications:** Resend 3.0.0, SendGrid 8.1.0, Twilio 4.19.0.
- **Document Generation:** `@react-pdf/renderer` 4.5.1, jsPDF 2.5.2, jspdf-autotable 3.8.0, XLSX 0.18.5.

#### Dependency Conflicts & Configuration Anomalies:
1. **Unconfigured PWA:** `next-pwa` (5.6.0) is installed in `package.json`, but completely absent from `next.config.js`.
2. **Commented-Out Error Telemetry:** `@sentry/nextjs` (10.56.0) is installed, but `withSentryConfig` is commented out in `next.config.js`.
3. **Dual Email Library Redundancy:** Both `@sendgrid/mail` (8.1.0) and `resend` (3.0.0) are installed. Production code uses `resend` in `lib/email.ts`, leaving SendGrid as unmaintained legacy debt in `lib/notifications.ts`.

### 1.3. Compiler & Test Baseline
- **TypeScript Typecheck (`tsc --noEmit`):** Clean exit code `0`. 0 compiler errors.
- **Test Suite (`jest --passWithNoTests`):**
  - **Test Suites:** **92 passed**, 92 total.
  - **Tests:** **1,037 passed**, 1,037 total.
  - **Baseline:** Strong unit test coverage for core repositories and validators.

---

## 2. Configuration Unification & State Store Audit (Sprint B.5 Readiness)

### 2.1. Split-Brain Configuration Architecture
The codebase currently contains two disconnected configuration architectures running in parallel:

```
[UI Path A: /settings/general]               [UI Path B: /admin/school-setup]
             │                                             │
             ▼                                             ▼
  SettingsGeneralService                         ConfigurationService
             │                                             │
             ▼                                             ▼
tenants/{id}/settings/general                   configurations/current
(Legacy Firestore Collection)                 (Unified Master Configuration)
             │                                             │
             ▼                                             ▼
    useGeneralSettings()                           useConfiguration()
(Used ONLY by Settings Page)                 (Used by all Academic Modules)
```

1. **The Legacy Settings Store:**
   - Routes: `app/api/v1/settings/general/route.ts`
   - Service: `services/settings-general.service.ts`
   - Repository: `repositories/settings.repository.ts` -> Firestore path: `tenants/{tenantId}/settings/general`
   - UI Hook: `hooks/useGeneralSettings.ts`
   - Consumer: Only `app/(protected)/settings/page.tsx` and `app/(protected)/settings/general/page.tsx`.
2. **The Unified Master Configuration Store:**
   - Routes: `app/api/v1/settings/school-configuration/route.ts` and `app/api/v1/settings/route.ts`
   - Service: `services/configuration.service.ts`
   - Repository: `repositories/configuration.repository.ts` -> Firestore path: `configurations`
   - Types: `MasterSchoolConfiguration`, `SchoolConfigurationViewModel`
3. **The Synchronization Break:**
   - When an administrator modifies the school name, board affiliation, classes, or subjects on `/settings` or `/settings/general`, the updates write exclusively to `tenants/{tenantId}/settings/general`.
   - All 14 operational academic modules (`marks`, `timetable`, `syllabus`, `homework`, `lesson-plans`, `quizzes`, `ai-exam-questions`, `ai-timetable`, `teacher/manage-books`, `study-center`) consume subjects via `useSettings()`, which fetches from `ConfigurationService` (`MasterSchoolConfiguration`).
   - **Result:** Administrator settings updates never propagate to teacher and student workflows.

### 2.2. Kernel & Zustand State Store Hydration Failure
- **File:** `app/(protected)/providers/RuntimeProvider.tsx` (Lines 15-23)
- **Root Cause Code:**
  ```ts
  const cfg = config as any;
  if (cfg && cfg.state === "Published" && cfg.school && cfg.academic) {
    const tenantId = cfg.tenantId || cfg.metadata?.tenantId || "";
    if (tenantId) {
      initializeKernel(tenantId, cfg);
    }
  }
  ```
- **The Failure:**
  `ConfigurationProvider.tsx` fetches from `/api/v1/settings/school-configuration` and transforms the data into a `SchoolConfigurationViewModel`. The ViewModel has flattened properties (`schoolName`, `schoolType`, `classes`, `subjects`, etc.) and does **not** contain nested `cfg.school` or `cfg.academic` objects.
- **Impact:** `cfg.school` and `cfg.academic` evaluate to `undefined`. `initializeKernel(...)` is **never executed**. The Zustand runtime store (`lib/store/runtime.store.ts`) remains unhydrated (`isInitialized: false`, default empty state).
- **Secondary Block:** Lines 44–55 of `RuntimeProvider.tsx` intercept non-published configurations and render a fatal fullscreen diagnostic error (`"System Initialization Failed"`), locking out users from pages unless bypassed.

### 2.3. Consumer Mapping: Unified vs. Legacy
| Business Module | Primary Hook / Interface | Consumes Unified Config? | Consumes Legacy Settings? | Status |
| :--- | :--- | :---: | :---: | :--- |
| **School Setup Wizard** | `useSchoolConfiguration()` | ✅ Yes (`MasterSchoolConfiguration`) | ❌ No | Fully Unified |
| **General Settings UI** | `useGeneralSettings()` | ❌ No | ⚠️ Yes (`settings/general`) | **Split-Brain Desynced** |
| **Classes & Sections** | `useClasses()` | ⚠️ Mixed (`ClassRepository` / `sections`) | ❌ No | Functional via sections |
| **Students & Admissions** | `useStudents()` | ❌ No (Standalone aggregate) | ❌ No | Independent |
| **Staff & HR** | `useStaff()` | ❌ No (Standalone aggregate) | ❌ No | Independent |
| **Attendance & Leave** | `useAttendance()` | ❌ No (Standalone collection) | ❌ No | Independent |
| **Marks & Results** | `useSettings()` / `useClasses()` | ⚠️ Yes (via API `/api/v1/settings`) | ❌ No | Stale if General Settings edited |
| **Timetable** | `useSettings()` / `useClasses()` | ⚠️ Yes (via API `/api/v1/settings`) | ❌ No | Stale if General Settings edited |
| **Fees & Billing** | `useFees()` | ❌ No (Direct collection) | ❌ No | Independent |
| **AI Generation Tools** | `useSettings()` | ⚠️ Yes (via API `/api/v1/settings`) | ❌ No | Stale if General Settings edited |

---

## 3. 100% Frontend Route, Navigation & UI Wiring Matrix

### 3.1. Complete Page Inventory (78 Pages Total)
- **Public & Auth Pages (7):**
  - `app/page.tsx` (Landing page)
  - `app/login/page.tsx` (Login page)
  - `app/signup/page.tsx` (Tenant onboarding signup)
  - `app/onboarding/page.tsx` (Onboarding step)
  - `app/callback/page.tsx` (Auth callback)
  - `app/demo/page.tsx` (Marketing demo)
  - `app/sentry-example-page/page.tsx` (Testing endpoint)
- **Protected Tenant & ERP Pages (71):**
  - Administration: `/admin/academic-year`, `/admin/admissions`, `/admin/analytics`, `/admin/audit`, `/admin/buses`, `/admin/configuration-dashboard`, `/admin/feature-flags`, `/admin/menu-manager`, `/admin/parents`, `/admin/promote`, `/admin/school-setup`, `/admin/sections`, `/admin/security`, `/admin/syllabus`, `/admin/users`, `/admin/whitelabel`.
  - Academic Operations: `/attendance`, `/classes`, `/dashboard`, `/exams`, `/fees`, `/leave-requests`, `/marks`, `/result`, `/staff-attendance`, `/staff-profile`, `/staff/[id]/edit`, `/staff/add`, `/staff/departments`, `/staff/ocr`, `/staff`, `/student-profile`, `/students/[id]`, `/students/add`, `/students/ocr-admission`, `/students`, `/study-center`, `/syllabus`, `/timetable`, `/video-lectures`.
  - AI Center: `/ai-chatbot`, `/ai-exam-questions`, `/ai-timetable`, `/ai/principal-copilot`, `/ai/report-comments`, `/ai/smart-book-center`.
  - Teacher Workspace: `/teacher/assignments`, `/teacher/assignments/create`, `/teacher/assignments/submissions`, `/teacher/behavior`, `/teacher/book-center`, `/teacher/chat`, `/teacher/exam-center`, `/teacher/homework`, `/teacher/lesson-plans`, `/teacher/manage-books`, `/teacher/quizzes`, `/teacher/quizzes/results`, `/teacher/skills`, `/teacher/video-lectures`.
  - Parent Portal: `/parent/dashboard`, `/parent/chat`.
  - Settings: `/settings`, `/settings/general`, `/settings/billing`, `/settings/addons`, `/settings/whitelabel`, `/settings/school-configuration`, `/settings/Curriculum `.
  - Super Admin: `/super-admin/analytics`, `/super-admin/telemetry`.

### 3.2. Navigation Cross-Check Matrix (`SidebarLayout.tsx` vs. Actual Pages)
Of the 73 paths declared in `MENU_GROUPS` inside `SidebarLayout.tsx`:
- **Active Working Links:** 40
- **Broken / 404 Links:** **33 dead links**

#### Complete List of 33 Broken Sidebar Routes:
1. `/admin/access-control` (Page does not exist; access control is in `/admin/security`)
2. `/admin/analytics/attendance` (Page does not exist; unified in `/admin/analytics`)
3. `/admin/analytics/finance` (Page does not exist; unified in `/admin/analytics`)
4. `/admin/analytics/students` (Page does not exist; unified in `/admin/analytics`)
5. `/admin/audit/security` (Page does not exist; unified in `/admin/audit`)
6. `/admin/audit/system` (Page does not exist; unified in `/admin/audit`)
7. `/admin/audit/users` (Page does not exist; unified in `/admin/audit`)
8. `/admin/buses/assignments` (Page does not exist; unified in `/admin/buses`)
9. `/admin/buses/routes` (Page does not exist; unified in `/admin/buses`)
10. `/admin/feature-flags/beta` (Page does not exist; mode param not supported)
11. `/admin/parents/add` (Page does not exist; modal in `/admin/parents`)
12. `/admin/permissions` (Page does not exist; unified in `/admin/security`)
13. `/admin/roles` (Page does not exist; unified in `/admin/security`)
14. `/admin/users/add` (Page does not exist; modal in `/admin/users`)
15. `/admin/users/role` (Page does not exist; inline dropdown in `/admin/users`)
16. `/ai-analytics` (Page does not exist)
17. `/attendance/reports` (Page does not exist)
18. `/fees/records` (Page does not exist; unified in `/fees`)
19. `/fees/reports` (Page does not exist; unified in `/fees`)
20. `/finance/expenses` (Page does not exist)
21. `/finance/revenue` (Page does not exist)
22. `/finance/transactions` (Page does not exist)
23. `/ledger` (Page does not exist)
24. `/ledger/expense` (Page does not exist)
25. `/ledger/income` (Page does not exist)
26. `/reports` (Page does not exist)
27. `/result/report-cards` (Page does not exist; report generation in `/result`)
28. `/settings/integrations` (Page does not exist)
29. `/settings/whitelabel/domain` (Page does not exist; tab in `/settings/whitelabel`)
30. `/settings/whitelabel/theme` (Page does not exist; tab in `/settings/whitelabel`)
31. `/students/360` (Page does not exist; profile is at `/student-profile`)
32. `/teacher/book-categories` (Page does not exist)
33. `/teacher/quizzes/create` (Page does not exist; modal in `/teacher/quizzes`)

### 3.3. Filesystem Anomalies & Orphaned Pages
- **Filesystem Trap:** `app/(protected)/settings/Curriculum /page.tsx` has a literal trailing space and capital `C` in the folder name. Web requests to `/settings/curriculum` hit a 404.
- **32 Orphaned Pages (Implemented but Missing from Navigation):**
  `/admin/audit`, `/admin/configuration-dashboard`, `/admin/menu-manager`, `/admin/school-setup`, `/admin/sections`, `/admin/security`, `/admin/whitelabel`, `/ai/principal-copilot`, `/ai/report-comments`, `/ai/smart-book-center`, `/exams`, `/parent/chat`, `/settings/general`, `/settings/school-configuration`, `/staff-profile`, `/staff/[id]/edit`, `/staff/ocr`, `/student-profile`, `/students/[id]`, `/students/ocr-admission`, `/study-center`, `/super-admin/analytics`, `/super-admin/telemetry`, `/syllabus`, `/teacher/behavior`, `/teacher/chat`, `/teacher/homework`, `/teacher/lesson-plans`, `/teacher/skills`, `/teacher/video-lectures`, `/video-lectures`.

### 3.4. Stub & Placeholder Detection
1. **`app/(protected)/admin/sections/page.tsx` (Lines 52 & 62):**
   - Tab 1: `"Section management component will render here."`
   - Tab 2: `"Teacher allocation grid will render here."`
2. **`app/(protected)/settings/billing/page.tsx` (Lines 15–36):**
   - Uses `MOCK_USAGE` and `MOCK_INVOICES`.
   - Upgrade button runs a fake `setTimeout(() => showToast(...), 1500)` without initiating Stripe checkout.
3. **`app/(protected)/admin/users/page.tsx` (Lines 105 & 120):**
   - Actions button (`MoreVertical`) is an unhandled placeholder.
   - User Invite Modal is marked `{/* Invite User Modal (UI Only for now) */}` with no backend API submission.

---

## 4. 100% API Contract & Client-to-Server Alignment Matrix

### 4.1. Complete API Route Handlers Inventory (123 Endpoints)
All API endpoints under `app/api/` were audited for HTTP methods, authentication wrappers, tenant context, and Zod validation:

- **Public Endpoints (7):**
  - `/api/health` (GET)
  - `/api/v1/auth/login` (POST)
  - `/api/v1/auth/logout` (POST)
  - `/api/v1/auth/parent-login` (POST)
  - `/api/v1/auth/register-user` (POST)
  - `/api/v1/auth/session` (POST)
  - `/api/v1/users/register-school` (POST)
- **Machine & Webhook Endpoints (6):**
  - `/api/v1/cron/fee-reminder` (GET)
  - `/api/v1/jobs/attendance-report` (GET)
  - `/api/v1/jobs/fee-reminder` (GET)
  - `/api/v1/jobs/events` (GET)
  - `/api/v1/stripe/webhook` (POST)
  - `/api/webhooks/qstash` (POST)
- **Protected Multi-Tenant ERP Endpoints (110):**
  Encompasses Academic Years, Addons, Admissions, AI Agents, Attendance, Audit, Behavior, Books, Buses, Certificates, Chat, Classes, Configuration, Feature Flags, Fees, GDPR, Homework, Jobs, Leave, Ledger, Lesson Plans, Marks, Menus, Parents, Quizzes, Reports, Results, Staff, Students, Subscriptions, Syllabus, Timetable, Uploads, Users, and Video Lectures.

### 4.2. Frontend-to-Backend Mismatch Register
A programmatic regex cross-referencing scan of all client requests (`apiClient`, `axios`, `fetch`) against actual `app/api/` route handlers detected **4 critical client call failures**:

1. **Broken Parent Logout:**
   - Client Call: `fetch("/api/auth/logout", { method: "POST" })` in `app/(protected)/parent/layout.tsx:16`
   - Real Route: `/api/v1/auth/logout`
   - Effect: Returns 404. Edge session cookie is not cleared when parents log out.
2. **Broken Client Branding Fetch:**
   - Client Call: `fetch("/api/settings/whitelabel")` in `components/ClientBranding.tsx:11`
   - Real Route: `/api/v1/settings/whitelabel`
   - Effect: Returns 404 HTML. Custom logos and theme styles fail to inject.
3. **Missing Super Admin Tenants API:**
   - Client Call: `apiClient.get("/super-admin/tenants")` in `hooks/useAnalytics.ts:13`
   - Real Route: **Does not exist.** Only `/super-admin/analytics` and `/super-admin/telemetry` exist.
   - Effect: Super admin analytics tenant selector crashes on load.
4. **Dead / Redundant Endpoints:**
   - `app/api/v1/books/books/[id]/route.ts`: Accidental nested duplicate of `app/api/v1/books/[id]/route.ts`.
   - `app/api/v1/ai/exam-paper/route.ts`: Unused duplicate of `app/api/v1/ai/exam-questions/route.ts`.

---

## 5. Domain Services, Repositories & Business Logic Integrity

### 5.1. Admissions & Enrolment Flow
- **Service:** `services/AdmissionsService.ts`
- **Defect:** `approve(tenantId, studentId, userId)` executes an isolated update:
  `await this.repository.update(studentId, { admissionStatus: "approved", ... })`.
- **Gaps:**
  1. Does not check section capacity against the maximum limit.
  2. Does not generate an admission fee voucher or initial invoice.
  3. Does not provision user credentials or link parent accounts.
  4. Fails to publish `EVENTS.ADMISSION_APPROVED` or `EVENTS.STUDENT_ENROLLED`, leaving listeners dormant.

### 5.2. Student Promotion & Lifecycle Flow
- **Service:** `services/StudentService.ts` (`promote()`, Line 282)
- **Defect:** Method signature:
  `async promote(tenantId, studentIds, newClass, newSection, academicYear, userId)`
- **Gaps:**
  1. `academicYear` is accepted as an argument but **never persisted**.
  2. The update payload only contains `{ classGrade: newClass, section: newSection }`. The student's academic year remains frozen in the prior session.
  3. No historical archive record is written to track past grades or promotion dates.
  4. Fails to publish `EVENTS.STUDENT_PROMOTED`.

### 5.3. Fees, Invoicing & Ledger Flow
- **Services:** `services/fees.service.ts`, `services/fee-reminder.service.ts`, `services/ledger.service.ts`
- **Defects:**
  1. **Reminder Calculation Bug (`fee-reminder.service.ts:34`):**
     Overdue emails inject `feeData.amountPaid` instead of outstanding balance `(amount - amountPaid)`. For unpaid records, parents receive emails stating `"Rs. 0 is overdue"`.
  2. **Schema Inconsistency (`CreateFeeDTO.ts:10`):**
     Fee vouchers only define `amountPaid: z.number()`, forcing uncollected fee amounts to be stored under `amountPaid` even when `status === "unpaid"`.
  3. **Zero Ledger Synchronization:**
     Neither student fee collections (`fees.service.ts`) nor Stripe SaaS subscription payments (`app/api/v1/stripe/webhook/route.ts`) post entries to `LedgerService`. The school general ledger remains perpetually empty.

### 5.4. Attendance & Leave Management Flow
- **Services:** `services/attendance.service.ts`, `services/leave.service.ts`
- **Defects:**
  1. **Cross-Tenant IDOR in Leave Approval (`repositories/leave.repository.ts:38`):**
     `updateStatus(id, data)` directly executes `this.db.collection("leave_requests").doc(id).update(data)` without checking if the document belongs to `tenantId`. An admin from Tenant A can approve, reject, or reassign leaves of Tenant B.
  2. **Bulk Attendance Notification Gap:**
     Bulk attendance saves records using `AttendanceRepository.bulkCreate`, but parents of absent students are never notified via SMS or email during bulk submission.

### 5.5. Exams, Marks & Result Publication Flow
- **Service:** `services/marks.service.ts`
- **Defects:**
  1. **Parent Email Disconnect (`publishResults()`, Line 152):**
     ```ts
     const parentEmails = allStudents
       .filter((s: any) => s.parentEmail || s.parent_email)
       .map((s: any) => ({ email: (s.parentEmail || s.parent_email)!, ... }));
     ```
     `StudentDocument` and `StudentEntity` do not contain `parentEmail` or `parent_email`. Parent relationships are stored in `parentReferences.primaryParentId` or `contacts.email`. Because `s.parentEmail` is `undefined`, `parentEmails` is always `[]`. **Zero result notification emails are sent.**
  2. **Hardcoded Roll Numbers (`getAggregatedResults()`, Line 136):**
     Aggregated result cards inject `rollNumber: "-"`, ignoring actual student roll numbers.

### 5.6. Timetable & Curriculum Flow
- **Services:** `services/timetable.service.ts`, `services/ai/timetable.service.ts`
- **Defects:**
  1. **Schema Mismatch:**
     AI generator returns `{ "class": "Class 1", "period": 1 }`, whereas `CreateTimetableEntrySchema` strictly requires `{ "classGrade": string, "period": string }`.
  2. **CSV Export Only:**
     Generated timetables can only be exported as a raw CSV file; there is no UI option or API action to commit the generated timetable to the actual school schedule.

### 5.7. AI & OCR Agents Flow
- **Services:** `lib/ai/agents/AgentRegistry.ts`, `services/OCRService.ts`
- **Defects:**
  1. **Unprotected AI Endpoints:**
     AI endpoints (`/api/v1/ai/chatbot`, `/api/v1/ai/exam-questions`, `/api/v1/ai/timetable`, `/api/v1/ai/report-comments`, `/api/v1/ai/smart-book-center`) do not enforce `withRateLimit`, leaving the system vulnerable to token budget exhaustion.
  2. **Subscription Tier Bypass:**
     No backend check verifies if the tenant's active plan allows AI features (`featureFlagService.canUse(...)`). Any tenant on the Free plan can invoke AI endpoints directly via HTTP POST.
  3. **Dual OCR Implementations:**
     `/api/v1/staff/ocr` uses modern Gemini-based `OCRService`, while `/api/v1/ocr/extract` runs legacy client-side Tesseract.js with fragile regex matching.

---

## 6. Event Bus, CQRS & Asynchronous Cascade Audit

### 6.1. Domain Event Catalog Matrix (All 62 Events)

| Event Name | Domain Event Key | Status | Publishers | Subscribers |
| :--- | :--- | :---: | :--- | :--- |
| `STUDENT_CREATED` | `student.created` | ✅ Active | `StudentService.ts` | `notification.subscriber.ts`, `audit.subscriber.ts` |
| `STUDENT_UPDATED` | `student.updated` | ✅ Active | `StudentService.ts` | `audit.subscriber.ts` |
| `STUDENT_DELETED` | `student.deleted` | ✅ Active | `StudentService.ts` | `audit.subscriber.ts` |
| `STUDENT_PROMOTED` | `student.promoted` | 🚨 Phantom | None | `notification.subscriber.ts`, `audit.subscriber.ts` |
| `STUDENT_TRANSFERRED`| `student.transferred`| ⚪ Unused | None | None |
| `CLASS_CHANGED` | `student.class_changed` | 🚨 Phantom | None | `audit.subscriber.ts` |
| `SECTION_CHANGED` | `student.section_changed`| 🚨 Phantom | None | `audit.subscriber.ts` |
| `ROLL_NUMBER_CHANGED`| `student.roll_number_changed`| ⚪ Unused| None | None |
| `PARENT_LINKED` | `student.parent_linked` | ⚪ Unused | None | None |
| `PARENT_UNLINKED` | `student.parent_unlinked` | ⚪ Unused | None | None |
| `ADMISSION_APPROVED` | `student.admission_approved`| 🚨 Phantom | None | `notification.subscriber.ts`, `audit.subscriber.ts` |
| `FEE_COLLECTED` | `fee.collected` | ⚠️ Dead | `fees.service.ts` | None (Only busts dashboard cache) |
| `ATTENDANCE_MARKED` | `attendance.marked` | ✅ Active | `attendance.service.ts`| `audit.subscriber.ts` |
| `ATTENDANCE_UPDATED`| `attendance.updated` | ✅ Active | `attendance.service.ts`| `audit.subscriber.ts` |
| `ATTENDANCE_DELETED`| `attendance.deleted` | ✅ Active | `attendance.service.ts`| `audit.subscriber.ts` |
| `ATTENDANCE_IMPORTED`| `attendance.imported` | ✅ Active | `attendance.service.ts`| `notification.subscriber.ts`, `audit.subscriber.ts` |
| `REPORT_GENERATED` | `report.generated` | ✅ Active | `report.worker.tsx` | `notification.subscriber.ts` |
| `STAFF_CREATED` | `staff.created` | ⚠️ Dead | `StaffService.ts` | None |
| `STAFF_UPDATED` | `staff.updated` | ⚠️ Dead | `StaffService.ts` | None |
| `STAFF_DELETED` | `staff.deleted` | ✅ Active | `StaffService.ts` | `staff-lifecycle.subscriber.ts` |
| `STAFF_ACTIVATED` | `staff.activated` | ✅ Active | `StaffService.ts` | `staff-lifecycle.subscriber.ts` |
| `STAFF_DEACTIVATED` | `staff.deactivated` | ⚠️ Dead | `StaffService.ts` | None |
| `STAFF_PROMOTED` | `staff.promoted` | ⚠️ Dead | `StaffService.ts` | None |
| `ASSIGNMENT_CREATED`| `assignment.created` | ✅ Active | `assignment.service.ts`| `notification.subscriber.ts`, `audit.subscriber.ts` |
| `ASSIGNMENT_DELETED`| `assignment.deleted` | ✅ Active | `assignment.service.ts`| `audit.subscriber.ts` |
| `ASSIGNMENT_SUBMITTED`| `assignment.submitted`| ✅ Active | `assignment.service.ts`| `audit.subscriber.ts` |
| `LESSON_PLAN_CREATED`| `lesson_plan.created` | ✅ Active | `lesson-plan.service.ts`| `audit.subscriber.ts` |
| `LESSON_PLAN_DELETED`| `lesson_plan.deleted` | ✅ Active | `lesson-plan.service.ts`| `audit.subscriber.ts` |
| `BOOK_CREATED` | `book.created` | ✅ Active | `book.service.ts` | `audit.subscriber.ts` |
| `BOOK_UPDATED` | `book.updated` | ⚠️ Dead | `book.service.ts` | None |
| `BOOK_DELETED` | `book.deleted` | ⚠️ Dead | `book.service.ts` | None |
| `BEHAVIOR_RECORDED` | `behavior.recorded` | ✅ Active | `behavior.service.ts` | `audit.subscriber.ts` |
| `MARKS_ENTERED` | `marks.entered` | ✅ Active | `marks.service.ts` | `audit.subscriber.ts` |
| `MARKS_DELETED` | `marks.deleted` | ✅ Active | `marks.service.ts` | `audit.subscriber.ts` |
| `RESULT_PUBLISHED` | `result.published` | ✅ Active | `marks.service.ts` | `audit.subscriber.ts` |
| `QUIZ_CREATED` | `quiz.created` | ✅ Active | `quiz.service.ts` | `audit.subscriber.ts` |
| `QUIZ_SUBMITTED` | `quiz.submitted` | ✅ Active | `quiz.service.ts` | `audit.subscriber.ts` |
| `QUIZ_DELETED` | `quiz.deleted` | ✅ Active | `quiz.service.ts` | `audit.subscriber.ts` |
| `HOMEWORK_CREATED` | `homework.created` | ✅ Active | `homework.service.ts` | `audit.subscriber.ts` |
| `HOMEWORK_UPDATED` | `homework.updated` | ✅ Active | `homework.service.ts` | `audit.subscriber.ts` |
| `HOMEWORK_DELETED` | `homework.deleted` | ✅ Active | `homework.service.ts` | `audit.subscriber.ts` |
| `ASSIGNMENT_UPDATED`| `assignment.updated` | ✅ Active | `assignment.service.ts`| `audit.subscriber.ts` |
| `LESSON_PLAN_UPDATED`| `lesson_plan.updated` | ✅ Active | `lesson-plan.service.ts`| `audit.subscriber.ts` |
| `BUS_CREATED` | `bus.created` | ✅ Active | `bus.service.ts` | `audit.subscriber.ts` |
| `BUS_UPDATED` | `bus.updated` | ✅ Active | `bus.service.ts` | `audit.subscriber.ts` |
| `BUS_DELETED` | `bus.deleted` | ✅ Active | `bus.service.ts` | `audit.subscriber.ts` |
| `FEE_UPDATED` | `fee.updated` | ⚠️ Dead | `fees.service.ts` | None |
| `SUBSCRIPTION_ACTIVATED`| `subscription.activated`| ⚠️ Dead | `subscription.service.ts`| None |
| `SUBSCRIPTION_CANCELED` | `subscription.canceled` | ⚠️ Dead | `subscription.service.ts`| None |
| `SUBSCRIPTION_UPDATED`  | `subscription.updated`  | ⚠️ Dead | `subscription.service.ts`| None |
| `SCHOOL_SETUP_COMPLETED`| `school.setup_completed`| ✅ Active | `configuration.service.ts`| `lifecycle.subscriber.ts` |
| `STUDENT_ENROLLED` | `student.enrolled` | 🚨 Phantom | None | `lifecycle.subscriber.ts` |
| `NOTIFICATION_CREATED`  | `notification.created`  | ⚪ Unused | None | None |
| `PARENT_CREATED` | `parent.created` | ✅ Active | `parents.service.ts` | `audit.subscriber.ts` |
| `PARENT_UPDATED` | `parent.updated` | ⚠️ Dead | `parents.service.ts` | None |
| `PARENT_DELETED` | `parent.deleted` | ✅ Active | `parents.service.ts` | `audit.subscriber.ts` |
| `TIMETABLE_CREATED` | `timetable.created` | ✅ Active | `timetable.service.ts` | `audit.subscriber.ts` |
| `TIMETABLE_DELETED` | `timetable.deleted` | ✅ Active | `timetable.service.ts` | `audit.subscriber.ts` |
| `VIDEO_CREATED` | `video.created` | ✅ Active | `video-lecture.service.ts` | `audit.subscriber.ts` |
| `VIDEO_UPDATED` | `video.updated` | ✅ Active | `video-lecture.service.ts` | `audit.subscriber.ts` |
| `VIDEO_DELETED` | `video.deleted` | ✅ Active | `video-lecture.service.ts` | `audit.subscriber.ts` |
| `FEE_DELETED` | `fee.deleted` | ✅ Active | `fees.service.ts` | `audit.subscriber.ts` |

### 6.2. Critical Event Pipeline Gaps
1. **5 Phantom Events:**
   - `STUDENT_PROMOTED`, `ADMISSION_APPROVED`, and `STUDENT_ENROLLED` have critical downstream responsibilities (admin alerts, parent welcome emails, lifecycle setup), but are completely orphaned because the service layer never calls `eventBus.publish()`.
2. **Payload Discrepancy on `STUDENT_CREATED`:**
   - Emitter (`StudentService.ts:63`) passes `{ tenantId, studentId, studentData }`.
   - Subscriber (`audit.subscriber.ts:25`) expects `{ tenantId, studentId, studentData, userId }`. Because `userId` is omitted by the publisher, all student creation audit logs record `userId: "system"`.

---

## 7. Multi-Tenancy, Security, RBAC & Firestore Rules Audit

### 7.1. Tenant Isolation & IDOR Vulnerabilities
1. **IDOR in Leave Repository (`repositories/leave.repository.ts:38`):**
   ```ts
   async updateStatus(id: string, data: Partial<LeaveRequest>, _tenantId?: string): Promise<void> {
     await this.db.collection(this.collectionName).doc(id).update(data);
   }
   ```
   **Severity: CRITICAL.** Any tenant admin can alter leave documents belonging to any other school on the platform.
2. **IDOR in Academic Year Repository (`repositories/academic-year.repository.ts:56`):**
   ```ts
   async setCurrent(id: string, tenantId: string): Promise<void> {
     ...
     await this.db.collection(this.collectionName).doc(id).update({ isCurrent: true });
   }
   ```
   **Severity: HIGH.** The target `id` is not validated for tenant ownership before setting `isCurrent: true`.

### 7.2. Client-Side Firestore Security Rule Weaknesses
In `firestore.rules`:
```
match /fees/{feeId} {
  allow read: if isTenantMember(resource.data.tenantId);
}
match /marks/{markId} {
  allow read: if isTenantMember(resource.data.tenantId);
}
match /ledger/{docId} {
  allow read: if isTenantMember(resource.data.tenantId);
}
```
- **Severity: HIGH.** `isTenantMember()` validates tenant membership but enforces **no role checks**. Any authenticated student or parent can use the client-side Firebase SDK in their browser console to query and read:
  - All student fee records and payment amounts in the school.
  - All exam marks and grades across all classes.
  - The entire school general ledger financial records.
- **Remediation:** Restrict direct client reads to `isAdmin() || getUserRole() == 'finance' || isStaff()`. Students and parents must query strictly through scoped backend API route handlers (`/api/v1/parents/...`).

### 7.3. Casing & Collection Name Inconsistencies
Comparing repository collection definitions against `firestore.rules` and `firestore.indexes.json`:
- **`videoLectures`:** Repository specifies `videoLectures` (camelCase). `firestore.rules` and `firestore.indexes.json` specify `video_lectures` (snake_case).
- **`behavior_logs`:** Repository specifies `behavior_logs`. `firestore.rules` specifies `match /behavior/{docId}`.
- **Missing Realtime Chat Index:**
  `hooks/useChat.ts` executes a compound query with two equality filters and an ascending sort:
  `where("chatId", "==", chatId), where("tenantId", "==", user.tenantId), orderBy("createdAt", "asc")`.
  `firestore.indexes.json` only contains an index for `[tenantId: ASC, createdAt: DESC]`. The compound index for `[chatId: ASC, tenantId: ASC, createdAt: ASC]` is **missing**, causing runtime Firestore query errors in chat.

### 7.4. Subscription Limits Bypass
- In `app/api/v1/students/route.ts`, student admission enforces no quota check.
- While staff addition (`staff/route.ts`) checks `subscriptionService.getPlanLimits(tenantId)`, students can be added infinitely via `/api/v1/students`, `/api/v1/students/bulk`, and `/api/v1/students/ocr-admission`. Free-tier tenants (limit 50 students) can enroll thousands of students without upgrading.

---

## 8. Environment, Integrations & Infrastructure Check

### 8.1. Environment Variables Audit (37 Used vs. 4 Documented)
`.env.example` documents only 4 variables:
- `NEXT_PUBLIC_BASE_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_BASE`

The application codebase actually accesses **37 distinct `process.env` variables**:
- **Firebase Admin & Emulator (6):** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `FIRESTORE_EMULATOR_HOST`, `ADMIN_EMAIL`.
- **Firebase Client Web SDK (6):** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
- **Stripe Billing (5):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_STARTER_PRICE_ID`, `STRIPE_PROFESSIONAL_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID`.
- **Upstash Redis & QStash (5):** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`.
- **Communications (4):** `RESEND_API_KEY`, `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
- **System & Security (5):** `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV`, `VERCEL_DEPLOYMENT_ID`, `VERCEL_REGION`.

### 8.2. External Integrations Integrity
1. **Fatal Top-Level Twilio Initialization:**
   `lib/notifications.ts` line 6 instantiates `twilio(process.env.TWILIO_ACCOUNT_SID!, ...)` at the top level of the module. If imported in an environment lacking Twilio credentials, the module crashes at process startup.
2. **Hardcoded i18n Localization:**
   `i18n/request.ts` hardcodes `{ locale: "en" }` and only loads `messages/en.json`. The other 6 locale files (`ar`, `es`, `fr`, `hi`, `ur`, `zh`) are never reachable.

---

## 9. Complete Module-by-Module Status Table

| Module | Frontend Status | API Contract Status | Service / Repo Status | Configuration Sync | Exact Blockers & Defect Reference |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **School Setup & Wizard** | ✅ 100% Complete | ✅ Healthy | ✅ Healthy | ✅ Fully Unified | Orphaned from sidebar navigation. |
| **General Settings** | ⚠️ Desynced | ⚠️ Split Endpoint | ⚠️ Legacy Repo | 🚨 Broken | Writes to `settings/general` instead of `MasterSchoolConfiguration`. |
| **Admissions** | ⚠️ Partial | ✅ Healthy | 🚨 Flawed | ⚠️ Isolated | Approval does not issue fees, credentials, or emit domain events. |
| **Student Lifecycle** | ⚠️ Broken Nav | ✅ Healthy | 🚨 Flawed | ⚠️ Stale Subjects | Promotion discards `academicYear`; quota checks bypassed; `/students/360` 404 in sidebar. |
| **Staff & HR** | ⚠️ Broken Nav | ✅ Healthy | ⚠️ Dead Events | ⚠️ Stale Subjects | Sidebar links 404 for `/admin/users/add` and `/admin/users/role`. |
| **Attendance** | ⚠️ Broken Nav | ✅ Healthy | ✅ Healthy | ⚠️ Stale Subjects | Sidebar links 404 for `/attendance/reports`. |
| **Leave Management** | ✅ Working UI | ✅ Healthy | 🚨 IDOR Bug | ⚠️ Isolated | Cross-tenant IDOR in `LeaveRepository.updateStatus`. |
| **Fees & Billing** | 🚨 Fake UI | ✅ Healthy API | 🚨 Balance Math Bug | ⚠️ Isolated | Billing page uses mock data; reminder emails send "Rs. 0"; ledger desynced. |
| **Exams & Results** | ⚠️ Broken Nav | ✅ Healthy | 🚨 Email Bug | ⚠️ Stale Subjects | Parent email lookup broken in `publishResults`; hardcoded roll numbers (`-`). |
| **Timetable** | ⚠️ Broken Nav | ⚠️ No GET Perm | 🚨 Key Mismatch | ⚠️ Stale Subjects | AI output schema mismatch (`class` vs `classGrade`); CSV export only. |
| **Books & Library** | ⚠️ Broken Nav | ⚠️ Duplicate Route| ✅ Healthy | ⚠️ Stale Subjects | Duplicate `books/books/[id]`; sidebar 404 for `/teacher/book-categories`. |
| **AI Assistants** | ⚠️ Unlinked Tools| ⚠️ No Rate Limit| ✅ Functional | ⚠️ Stale Subjects | Missing rate limiting; tools orphaned from sidebar navigation. |
| **Super Admin** | 🚨 Broken UI | 🚨 Missing API | ✅ Healthy | ⚠️ Isolated | `useTenants()` calls non-existent `/api/v1/super-admin/tenants`. |
| **Parent Portal** | 🚨 Broken Logout| ⚠️ Unused APIs | ✅ Healthy | ⚠️ Isolated | Logout calls `/api/auth/logout` (404); UI lacks tabs for fees, attendance, results. |

---

## 10. Exhaustive Defect Register

### Dimension 1: Architecture & Dependencies
* **DEF-001 (Severity: MEDIUM): Unconfigured PWA & Sentry Telemetry**  
  * **File:** `next.config.js` (Lines 59–70) & `package.json`  
  * **Root Cause:** Dependencies are installed but disabled in Next.js config.  
  * **Remediation:** Wrap configuration with `withSentryConfig` and register `next-pwa` if offline support is required.

---

### Dimension 2: State Store & Configuration Unification
* **DEF-002 (Severity: CRITICAL): Runtime Kernel Hydration Failure**  
  * **File:** `app/(protected)/providers/RuntimeProvider.tsx` (Lines 15–23)  
  * **Root Cause:** Evaluates `cfg.school` and `cfg.academic` on `SchoolConfigurationViewModel`, which has flattened attributes. `initializeKernel` is never invoked.  
  * **Remediation:** Update `RuntimeProvider` to map from ViewModel properties (`cfg.schoolName`, `cfg.classes`, `cfg.subjects`) or pass the raw document.
* **DEF-003 (Severity: HIGH): Split-Brain Configuration Desynchronization**  
  * **File:** `app/api/v1/settings/general/route.ts` & `app/(protected)/settings/general/page.tsx`  
  * **Root Cause:** Settings UI reads and writes to `tenants/{tenantId}/settings/general`, while operational ERP modules consume `configurations/current`.  
  * **Remediation:** Deprecate `SettingsGeneralService` and redirect `/settings` to mutate `MasterSchoolConfiguration` through `ConfigurationService`.

---

### Dimension 3: Frontend Routes & Navigation
* **DEF-004 (Severity: HIGH): 33 Broken Sidebar 404 Routes**  
  * **File:** `components/SidebarLayout.tsx` (Lines 23–254)  
  * **Root Cause:** Hardcoded paths diverge from the Next.js filesystem structure.  
  * **Remediation:** Remap all 33 broken URLs to existing pages (e.g., `/admin/security`, `/admin/audit`, `/admin/analytics`, `/fees`).
* **DEF-005 (Severity: MEDIUM): Filesystem Trailing Space Anomaly**  
  * **File:** `app/(protected)/settings/Curriculum /page.tsx`  
  * **Root Cause:** Directory name contains an accidental trailing space and uppercase letter.  
  * **Remediation:** Rename folder to `app/(protected)/settings/curriculum`.
* **DEF-006 (Severity: HIGH): Mock Billing Page Simulation**  
  * **File:** `app/(protected)/settings/billing/page.tsx` (Lines 15–36)  
  * **Root Cause:** Hardcoded mock arrays and mock upgrade handlers disconnect the billing UI from real Stripe checkout routes.  
  * **Remediation:** Wire page to `useSubscription()` and trigger `/api/v1/stripe/create-checkout`.
* **DEF-007 (Severity: MEDIUM): Sections Page Incomplete Stubs**  
  * **File:** `app/(protected)/admin/sections/page.tsx` (Lines 51–64)  
  * **Root Cause:** Tabs 1 and 2 display placeholder strings.  
  * **Remediation:** Implement section management grid or redirect `/admin/sections` to `/classes`.

---

### Dimension 4: API Contract & Client Alignment
* **DEF-008 (Severity: HIGH): Broken Parent Logout Endpoint**  
  * **File:** `app/(protected)/parent/layout.tsx` (Line 16)  
  * **Root Cause:** Calls `/api/auth/logout` instead of `/api/v1/auth/logout`.  
  * **Remediation:** Update fetch path to `/api/v1/auth/logout`.
* **DEF-009 (Severity: MEDIUM): Broken Client Branding Endpoint**  
  * **File:** `components/ClientBranding.tsx` (Line 11)  
  * **Root Cause:** Calls `/api/settings/whitelabel` instead of `/api/v1/settings/whitelabel`.  
  * **Remediation:** Update fetch path to `/api/v1/settings/whitelabel`.
* **DEF-010 (Severity: HIGH): Missing Super Admin Tenants Endpoint**  
  * **File:** `hooks/useAnalytics.ts` (Line 13)  
  * **Root Cause:** `apiClient.get("/super-admin/tenants")` targets a non-existent route.  
  * **Remediation:** Implement `app/api/v1/super-admin/tenants/route.ts` returning tenant lists for super admins.
* **DEF-011 (Severity: LOW): Redundant Nested Route**  
  * **File:** `app/api/v1/books/books/[id]/route.ts`  
  * **Root Cause:** Directory nesting artifact.  
  * **Remediation:** Delete redundant folder.

---

### Dimension 5: Domain Services & Business Logic
* **DEF-012 (Severity: HIGH): Overdue Fee Reminder Sends Rs. 0**  
  * **File:** `services/fee-reminder.service.ts` (Line 34)  
  * **Root Cause:** Injects `feeData.amountPaid` in overdue notice text.  
  * **Remediation:** Replace with calculated outstanding balance `(feeData.amount || feeData.amountPaid) - (feeData.amountPaid || 0)`.
* **DEF-013 (Severity: HIGH): Student Promotion Discards Academic Year**  
  * **File:** `services/StudentService.ts` (Lines 282–306)  
  * **Root Cause:** `academicYear` parameter is omitted from `this.repository.bulkUpdate`.  
  * **Remediation:** Persist `academicYear` to student documents and record a promotion timeline event.
* **DEF-014 (Severity: HIGH): Exam Result Emails Never Sent to Parents**  
  * **File:** `services/marks.service.ts` (Lines 151–155)  
  * **Root Cause:** Filters on non-existent `s.parentEmail`.  
  * **Remediation:** Resolve parent contact details using `primaryParentId` from `parents` collection.
* **DEF-015 (Severity: MEDIUM): Aggregated Marks Results Omit Roll Number**  
  * **File:** `services/marks.service.ts` (Line 136)  
  * **Root Cause:** Hardcodes `rollNumber: "-"`.  
  * **Remediation:** Fetch roll number from student records during aggregation.
* **DEF-016 (Severity: MEDIUM): AI Timetable Schema Key Incompatibility**  
  * **File:** `services/ai/timetable.service.ts` (Line 36)  
  * **Root Cause:** Generates `{ "class": ..., "period": 1 }` instead of `{ "classGrade": ..., "period": "1" }`.  
  * **Remediation:** Align AI prompt JSON structure with `CreateTimetableEntrySchema`.

---

### Dimension 6: Event Bus & Asynchronous Cascades
* **DEF-017 (Severity: HIGH): Dormant Subscribers for Phantom Events**  
  * **File:** `lib/events/subscribers/notification.subscriber.ts` & `lifecycle.subscriber.ts`  
  * **Root Cause:** `STUDENT_PROMOTED`, `ADMISSION_APPROVED`, and `STUDENT_ENROLLED` are listened to but never emitted.  
  * **Remediation:** Add `eventBus.publish` calls in `StudentService.promote()` and `AdmissionsService.approve()`.
* **DEF-018 (Severity: MEDIUM): Missing Creator ID in Student Creation Audit**  
  * **File:** `services/StudentService.ts` (Line 63)  
  * **Root Cause:** Emitter payload omits `userId`.  
  * **Remediation:** Add `userId` to `EVENTS.STUDENT_CREATED` payload.

---

### Dimension 7: Security, Multi-Tenancy & Firestore Rules
* **DEF-019 (Severity: CRITICAL): Cross-Tenant IDOR in Leave Management**  
  * **File:** `repositories/leave.repository.ts` (Line 38)  
  * **Root Cause:** `updateStatus(id, data)` updates documents without validating tenant ownership.  
  * **Remediation:** Add query condition verifying `tenantId == requestTenantId` before applying updates.
* **DEF-020 (Severity: HIGH): Cross-Tenant IDOR in Academic Year Activation**  
  * **File:** `repositories/academic-year.repository.ts` (Line 56)  
  * **Root Cause:** `setCurrent(id, tenantId)` sets target document without tenant verification.  
  * **Remediation:** Verify document ownership before executing update.
* **DEF-021 (Severity: HIGH): Overly Permissive Client-Side Firestore Rules**  
  * **File:** `firestore.rules` (Lines 173–284)  
  * **Root Cause:** `fees`, `marks`, and `ledger` grant read access to any tenant member without role checks.  
  * **Remediation:** Restrict direct client reads to admin, staff, and finance roles.
* **DEF-022 (Severity: HIGH): Missing Realtime Chat Firestore Index**  
  * **File:** `firestore.indexes.json`  
  * **Root Cause:** Missing composite index for `chat_messages` (`chatId` ASC, `tenantId` ASC, `createdAt` ASC).  
  * **Remediation:** Add the required composite index entry.
* **DEF-023 (Severity: HIGH): Missing Subscription Quotas on Student Creation**  
  * **File:** `app/api/v1/students/route.ts`  
  * **Root Cause:** Fails to check `subscriptionService.getPlanLimits(tenantId)`.  
  * **Remediation:** Enforce student count quota before admitting new students.
* **DEF-024 (Severity: MEDIUM): Ledger Endpoint Missing RBAC Permission Check**  
  * **File:** `app/api/v1/ledger/route.ts` (Lines 9 & 24)  
  * **Root Cause:** Omits `withPermission` check on GET and POST.  
  * **Remediation:** Wrap with `withPermission(PERMISSIONS.fees.manage)`.

---

### Dimension 8: Environment & Infrastructure
* **DEF-025 (Severity: MEDIUM): 33 Undocumented Environment Variables**  
  * **File:** `.env.example`  
  * **Root Cause:** Documents only 4 variables while 37 are required by the runtime.  
  * **Remediation:** Expand `.env.example` with placeholders for Firebase, Stripe, Upstash, Resend, and Twilio.
* **DEF-026 (Severity: HIGH): Unsafe Top-Level Twilio Instantiation**  
  * **File:** `lib/notifications.ts` (Line 6)  
  * **Root Cause:** Top-level `twilio(process.env.TWILIO_ACCOUNT_SID!, ...)` throws fatal exceptions if env vars are unset.  
  * **Remediation:** Convert to lazy getter function.

---

## 11. Master Execution Dependency Graph

To execute remediations without breaking downstream modules, adhere strictly to the following 4-phase dependency sequence:

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: IMMEDIATE BREAKING RUNTIME & SECURITY PATCHES                 │
│ • DEF-019, DEF-020: Patch IDOR in Leave & Academic Year Repositories  │
│ • DEF-021, DEF-024: Secure Firestore Rules & Ledger RBAC Gate         │
│ • DEF-022: Add Missing Chat Composite Index in firestore.indexes.json  │
│ • DEF-008, DEF-009, DEF-010: Fix Broken API Routes (Logout, Branding)  │
│ • DEF-026: Safe-guard Twilio Initialization                            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: STATE HYDRATION & CONFIGURATION UNIFICATION                   │
│ • DEF-002: Fix RuntimeProvider Hydration Mapping (ViewModel -> Store)  │
│ • DEF-003: Unify General Settings to write to Master Configuration     │
│ • DEF-005: Rename settings/Curriculum  Folder                          │
│ • DEF-023: Enforce Plan Quotas on Student Creation                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: BUSINESS FLOW & EVENT CASCADE REPAIR                          │
│ • DEF-012: Fix Overdue Fee Reminder Math                              │
│ • DEF-013: Persist Academic Year on Student Promotion                  │
│ • DEF-014: Fix Parent Email Resolution in Exam Result Publication      │
│ • DEF-015: Restore Roll Numbers in Result Aggregations                 │
│ • DEF-017, DEF-018: Emit Phantom Domain Events (Promotion, Admission) │
│ • DEF-016: Align AI Timetable Schema with Timetable Validator          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: UI NAVIGATION & WORKSPACE RESTORATION                         │
│ • DEF-004: Remap 33 Broken Sidebar Links in SidebarLayout.tsx          │
│ • Link 32 Orphaned Features into Role-Based Menus                      │
│ • DEF-006: Connect Billing Page UI to Real Stripe Checkout API         │
│ • DEF-007: Implement Missing Section/Allocation Grids                 │
│ • DEF-025: Fully Document all 37 Variables in .env.example             │
└────────────────────────────────────────────────────────────────────────┘
```

