# EDUPILOT ENTERPRISE GOVERNANCE EVIDENCE

Generated: Tue Aug  4 09:32:08 PKT 2026

====================================================
1. GIT STATUS
====================================================
?? ARCHITECTURE_AUDIT.md
?? audit_batch7.csv
?? batch6_audit.csv
?? batch8_audit.csv
?? governance/

====================================================
2. RECENT COMMITS
====================================================
b249e5a (HEAD -> main, origin/main, origin/HEAD) test(configuration): add enterprise integration coverage
3c21d95 feat(admin): add configuration dashboard
eddbb75 feat(api): add configuration management endpoints
8b055fe feat(configuration): add configuration application services
0cc4cc8 feat(configuration): add configuration domain models and repositories
a730a1c (icy-maize) feat(architecture): complete Sprint 10 enterprise architecture modernization
48e4b38 fix(tests): resolve SectionRepository test failures
5c2d7b1 fix(tests): resolve QuizRepository test failures
c122a1b fix(tests): resolve JobRepository test failures
9ae7bf3 fix(tests): resolve SettingsRepository test failures
70cba43 fix(tests): resolve ConfigurationRepository test failures
cc85403 Sprint 9B: TypeScript fixes and test infrastructure updates
4f6d3f9 Add architecture reports, module standardization, and test improvements
75b9a23 (tag: sprint-07-repository-compliance, tag: pi-1-foundation-v1) refactor(repository): achieve repository interface compliance and standardization
ce63bb8 (tag: sprint-06-service-layer-enforcement) refactor(service-layer): enforce route to service architecture
cd13516 refactor(validation): consolidate validation schemas and remove duplicates
919c657 docs(engineering): complete Sprint 0 engineering baseline verification
7723280 Update session.service.ts
f7c34de Merge branch 'sprint-e02-enterprise-hardening'
33ec67d refactor(architecture): complete enterprise architecture remediation

====================================================
3. TYPESCRIPT
====================================================

====================================================
4. ESLINT
====================================================

> edupilot@0.1.0 lint
> next lint


./app/(protected)/admin/promote/page.tsx
31:9  Warning: The 'students' conditional could make the dependencies of useMemo Hook (at line 37) change on every render. Move it inside the useMemo callback. Alternatively, wrap the initialization of 'students' in its own useMemo() Hook.  react-hooks/exhaustive-deps

./app/(protected)/staff/page.tsx
257:29  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules

====================================================
5. TESTS
====================================================

> edupilot@0.1.0 test
> jest

PASS repositories/configuration.repository.test.ts
PASS repositories/staff.repository.test.ts
PASS __tests__/lib/mappers/shared.test.ts
PASS __tests__/lib/mappers/student.mapper.test.ts
PASS __tests__/lib/mappers/staff.mapper.test.ts
PASS repositories/attendance.repository.test.ts
PASS repositories/marks.repository.test.ts
PASS repositories/subscription.repository.test.ts
PASS repositories/base.repository.test.ts
PASS repositories/settings.repository.test.ts
PASS repositories/book.repository.test.ts
PASS repositories/audit.repository.test.ts
PASS repositories/section.repository.test.ts
PASS repositories/syllabus.repository.test.ts
PASS repositories/assignment.repository.test.ts
PASS repositories/fees.repository.test.ts
PASS repositories/academic-year.repository.test.ts
PASS __tests__/validators/all-validators.test.ts
PASS repositories/behavior.repository.test.ts
PASS repositories/parents.repository.test.ts
PASS repositories/bus.repository.test.ts
PASS repositories/ai-usage.repository.test.ts
PASS repositories/quiz.repository.test.ts
PASS repositories/tenant.repository.test.ts
PASS repositories/class.repository.test.ts
PASS repositories/leave.repository.test.ts
PASS repositories/ledger.repository.test.ts
PASS repositories/student.repository.test.ts
PASS __tests__/services/configuration.service.test.ts
PASS repositories/lesson-plan.repository.test.ts
PASS repositories/video-lecture.repository.test.ts
PASS __tests__/api/settings/school-configuration.test.ts
PASS repositories/invoice.repository.test.ts
PASS repositories/user.repository.test.ts
PASS repositories/homework.repository.test.ts
PASS repositories/tenant-branding.repository.test.ts
PASS repositories/timetable.repository.test.ts
PASS __tests__/lib/tenant-resolver.test.ts
PASS __tests__/services/configuration-health.service.test.ts
PASS repositories/job.repository.test.ts
PASS __tests__/architecture-compliance.test.ts
PASS __tests__/repositories/subscription.repository.test.ts
PASS repositories/curriculum.repository.test.ts
PASS repositories/feature-flag.repository.test.ts
PASS repositories/addons.repository.test.ts
PASS __tests__/api/register-user.test.ts
PASS __tests__/services/configuration-cache.service.test.ts
PASS repositories/chat.repository.test.ts
PASS repositories/menu.repository.test.ts
PASS __tests__/lib/auth-server.test.ts
PASS __tests__/api/attendance-report.test.ts
PASS __tests__/lib/events/event-bus.test.ts
PASS __tests__/api/job-status.test.ts
PASS __tests__/api/education-rules.test.ts
PASS __tests__/api/admin-users-role.test.ts
PASS __tests__/lib/events/event-worker.test.ts
PASS __tests__/api/curriculum-engine.test.ts
PASS repositories/event-outbox.repository.test.ts
PASS __tests__/api/admin-users.test.ts
PASS __tests__/api/ledger.test.ts
PASS __tests__/debug.test.ts
  ● Console

    console.log
      doc: {
        get: [Function: mockConstructor] {
          _isMockFunction: true,
          getMockImplementation: [Function (anonymous)],
          mock: [Getter/Setter],
          mockClear: [Function (anonymous)],
          mockReset: [Function (anonymous)],
          mockRestore: [Function (anonymous)],
          mockReturnValueOnce: [Function (anonymous)],
          mockResolvedValueOnce: [Function (anonymous)],
          mockRejectedValueOnce: [Function (anonymous)],
          mockReturnValue: [Function (anonymous)],
          mockResolvedValue: [Function (anonymous)],
          mockRejectedValue: [Function (anonymous)],
          mockImplementationOnce: [Function (anonymous)],
          withImplementation: [Function: bound withImplementation],
          mockImplementation: [Function (anonymous)],
          mockReturnThis: [Function (anonymous)],
          mockName: [Function (anonymous)],
          getMockName: [Function (anonymous)]
        }
      }

      at Object.<anonymous> (__tests__/debug.test.ts:17:13)

    console.log
      same mockDoc? true

      at Object.<anonymous> (__tests__/debug.test.ts:18:13)

PASS __tests__/api/chat.test.ts
PASS __tests__/integration/enterprise-workflows.test.ts
PASS repositories/dashboard-stats.repository.test.ts
PASS __tests__/api/students.test.ts

Test Suites: 65 passed, 65 total
Tests:       698 passed, 698 total
Snapshots:   0 total
Time:        4.776 s
Ran all test suites.

====================================================
6. BUILD
====================================================

> edupilot@0.1.0 build
> next build

  ▲ Next.js 14.2.3
  - Environments: .env.local

   Creating an optimized production build ...
 ⚠ Compiled with warnings

./node_modules/require-in-the-middle/index.js
Critical dependency: require function is used in a way in which dependencies cannot be statically extracted

Import trace for requested module:
./node_modules/require-in-the-middle/index.js
./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/index.js
./node_modules/@opentelemetry/instrumentation/build/esm/platform/index.js
./node_modules/@opentelemetry/instrumentation/build/esm/index.js
./node_modules/@sentry/node/build/cjs/integrations/tracing/express.js
./node_modules/@sentry/node/build/cjs/index.js
./node_modules/@sentry/nextjs/build/cjs/index.server.js
./app/sentry-example-page/page.tsx

   Linting and checking validity of types ...

./app/(protected)/admin/promote/page.tsx
31:9  Warning: The 'students' conditional could make the dependencies of useMemo Hook (at line 37) change on every render. Move it inside the useMemo callback. Alternatively, wrap the initialization of 'students' in its own useMemo() Hook.  react-hooks/exhaustive-deps

./app/(protected)/staff/page.tsx
257:29  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
   Collecting page data ...
   Generating static pages (0/85) ...
   Generating static pages (21/85) 
   Generating static pages (42/85) 
   Generating static pages (63/85) 
 ✓ Generating static pages (85/85)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                Size     First Load JS
┌ ƒ /                                      8.28 kB         136 kB
├ ƒ /_not-found                            883 B          88.5 kB
├ ƒ /admin/academic-year                   2.1 kB          162 kB
├ ƒ /admin/admissions                      8.51 kB         161 kB
├ ƒ /admin/analytics                       3.1 kB          219 kB
├ ƒ /admin/audit                           2.87 kB         163 kB
├ ƒ /admin/buses                           1.97 kB         162 kB
├ ƒ /admin/configuration-dashboard         5.06 kB         125 kB
├ ƒ /admin/feature-flags                   2.33 kB         163 kB
├ ƒ /admin/menu-manager                    20.9 kB         165 kB
├ ƒ /admin/parents                         3.22 kB         162 kB
├ ƒ /admin/promote                         4.21 kB         163 kB
├ ƒ /admin/school-setup                    11.2 kB         164 kB
├ ƒ /admin/sections                        5.52 kB         125 kB
├ ƒ /admin/security                        7.28 kB         151 kB
├ ƒ /admin/syllabus                        7.83 kB         128 kB
├ ƒ /admin/users                           2.59 kB         163 kB
├ ƒ /admin/whitelabel                      3.04 kB         163 kB
├ ƒ /ai-chatbot                            5.67 kB         120 kB
├ ƒ /ai-exam-questions                     7.23 kB         160 kB
├ ƒ /ai-timetable                          6.49 kB         159 kB
├ ƒ /ai/principal-copilot                  8 kB            155 kB
├ ƒ /ai/report-comments                    3.79 kB         163 kB
├ ƒ /ai/smart-book-center                  5.89 kB         120 kB
├ ƒ /api/health                            0 B                0 B
├ ƒ /api/sentry-example-api                0 B                0 B
├ ƒ /api/v1/academic-year                  0 B                0 B
├ ƒ /api/v1/academic-year/[id]             0 B                0 B
├ ƒ /api/v1/addons                         0 B                0 B
├ ƒ /api/v1/admin/delete-student           0 B                0 B
├ ƒ /api/v1/admin/feature-flags            0 B                0 B
├ ƒ /api/v1/admin/parents                  0 B                0 B
├ ƒ /api/v1/admin/rebuild-stats            0 B                0 B
├ ƒ /api/v1/admin/users                    0 B                0 B
├ ƒ /api/v1/admin/users/role               0 B                0 B
├ ƒ /api/v1/admissions/approve             0 B                0 B
├ ƒ /api/v1/admit-cards/bulk               0 B                0 B
├ ƒ /api/v1/ai/agents                      0 B                0 B
├ ƒ /api/v1/ai/chatbot                     0 B                0 B
├ ƒ /api/v1/ai/exam-paper                  0 B                0 B
├ ƒ /api/v1/ai/exam-questions              0 B                0 B
├ ƒ /api/v1/ai/report-comments             0 B                0 B
├ ƒ /api/v1/ai/smart-book-center           0 B                0 B
├ ƒ /api/v1/ai/timetable                   0 B                0 B
├ ƒ /api/v1/analytics                      0 B                0 B
├ ƒ /api/v1/assignments                    0 B                0 B
├ ƒ /api/v1/assignments/[id]               0 B                0 B
├ ƒ /api/v1/assignments/submit             0 B                0 B
├ ƒ /api/v1/attendance                     0 B                0 B
├ ƒ /api/v1/attendance/[id]                0 B                0 B
├ ƒ /api/v1/attendance/export              0 B                0 B
├ ƒ /api/v1/audit                          0 B                0 B
├ ƒ /api/v1/auth/login                     0 B                0 B
├ ƒ /api/v1/auth/logout                    0 B                0 B
├ ƒ /api/v1/auth/me                        0 B                0 B
├ ƒ /api/v1/auth/parent-login              0 B                0 B
├ ƒ /api/v1/auth/register-user             0 B                0 B
├ ƒ /api/v1/auth/session                   0 B                0 B
├ ƒ /api/v1/behavior                       0 B                0 B
├ ƒ /api/v1/books                          0 B                0 B
├ ƒ /api/v1/books/books/[id]               0 B                0 B
├ ƒ /api/v1/buses                          0 B                0 B
├ ƒ /api/v1/buses/[id]                     0 B                0 B
├ ƒ /api/v1/certificate                    0 B                0 B
├ ƒ /api/v1/chat                           0 B                0 B
├ ƒ /api/v1/classes                        0 B                0 B
├ ƒ /api/v1/configuration/dashboard        0 B                0 B
├ ƒ /api/v1/create-user                    0 B                0 B
├ ƒ /api/v1/cron/fee-reminder              0 B                0 B
├ ƒ /api/v1/curriculum/engine              0 B                0 B
├ ƒ /api/v1/curriculum/load                0 B                0 B
├ ƒ /api/v1/curriculum/preview             0 B                0 B
├ ƒ /api/v1/curriculum/upgrade             0 B                0 B
├ ƒ /api/v1/dashboard                      0 B                0 B
├ ƒ /api/v1/education/rules                0 B                0 B
├ ƒ /api/v1/feature-flags                  0 B                0 B
├ ƒ /api/v1/feature-flags/disabled         0 B                0 B
├ ƒ /api/v1/fees                           0 B                0 B
├ ƒ /api/v1/fees/[id]                      0 B                0 B
├ ƒ /api/v1/gdpr/delete/[id]               0 B                0 B
├ ƒ /api/v1/gdpr/export/[id]               0 B                0 B
├ ƒ /api/v1/homework                       0 B                0 B
├ ƒ /api/v1/jobs/[jobId]                   0 B                0 B
├ ƒ /api/v1/jobs/attendance-report         0 B                0 B
├ ƒ /api/v1/jobs/events                    0 B                0 B
├ ƒ /api/v1/jobs/fee-reminder              0 B                0 B
├ ƒ /api/v1/leave                          0 B                0 B
├ ƒ /api/v1/leave/arrange                  0 B                0 B
├ ƒ /api/v1/ledger                         0 B                0 B
├ ƒ /api/v1/lesson-plans                   0 B                0 B
├ ƒ /api/v1/marks                          0 B                0 B
├ ƒ /api/v1/marks/bulk                     0 B                0 B
├ ƒ /api/v1/marks/publish                  0 B                0 B
├ ƒ /api/v1/marks/skills                   0 B                0 B
├ ƒ /api/v1/menu                           0 B                0 B
├ ƒ /api/v1/ocr/extract                    0 B                0 B
├ ƒ /api/v1/parents                        0 B                0 B
├ ƒ /api/v1/parents/attendance             0 B                0 B
├ ƒ /api/v1/parents/dashboard              0 B                0 B
├ ƒ /api/v1/parents/fees                   0 B                0 B
├ ƒ /api/v1/parents/results                0 B                0 B
├ ƒ /api/v1/protected-data                 0 B                0 B
├ ƒ /api/v1/quizzes                        0 B                0 B
├ ƒ /api/v1/quizzes/[id]                   0 B                0 B
├ ƒ /api/v1/quizzes/results                0 B                0 B
├ ƒ /api/v1/quizzes/submit                 0 B                0 B
├ ƒ /api/v1/reports/generate               0 B                0 B
├ ƒ /api/v1/reports/generate-bulk          0 B                0 B
├ ƒ /api/v1/results                        0 B                0 B
├ ƒ /api/v1/settings                       0 B                0 B
├ ƒ /api/v1/settings/curriculum            0 B                0 B
├ ƒ /api/v1/settings/general               0 B                0 B
├ ƒ /api/v1/settings/school-configuration  0 B                0 B
├ ƒ /api/v1/settings/whitelabel            0 B                0 B
├ ƒ /api/v1/staff                          0 B                0 B
├ ƒ /api/v1/staff/[id]                     0 B                0 B
├ ƒ /api/v1/staff/[id]/ai                  0 B                0 B
├ ƒ /api/v1/staff/[id]/timeline            0 B                0 B
├ ƒ /api/v1/staff/analytics                0 B                0 B
├ ƒ /api/v1/staff/bulk                     0 B                0 B
├ ƒ /api/v1/staff/ocr                      0 B                0 B
├ ƒ /api/v1/stripe/create-checkout         0 B                0 B
├ ƒ /api/v1/stripe/webhook                 0 B                0 B
├ ƒ /api/v1/students                       0 B                0 B
├ ƒ /api/v1/students/[id]                  0 B                0 B
├ ƒ /api/v1/students/[id]/comment          0 B                0 B
├ ƒ /api/v1/students/[id]/timeline         0 B                0 B
├ ƒ /api/v1/students/360                   0 B                0 B
├ ƒ /api/v1/students/bulk                  0 B                0 B
├ ƒ /api/v1/students/get                   0 B                0 B
├ ƒ /api/v1/students/ocr-admission         0 B                0 B
├ ƒ /api/v1/students/promote               0 B                0 B
├ ƒ /api/v1/students/risk                  0 B                0 B
├ ƒ /api/v1/subscriptions                  0 B                0 B
├ ƒ /api/v1/subscriptions/activate         0 B                0 B
├ ƒ /api/v1/super-admin/analytics          0 B                0 B
├ ƒ /api/v1/super-admin/telemetry          0 B                0 B
├ ƒ /api/v1/syllabus                       0 B                0 B
├ ƒ /api/v1/syllabus/[id]                  0 B                0 B
├ ƒ /api/v1/timetable                      0 B                0 B
├ ƒ /api/v1/upload                         0 B                0 B
├ ƒ /api/v1/users/get                      0 B                0 B
├ ƒ /api/v1/users/init                     0 B                0 B
├ ƒ /api/v1/users/register-school          0 B                0 B
├ ƒ /api/v1/video-lectures                 0 B                0 B
├ ƒ /api/webhooks/qstash                   0 B                0 B
├ ƒ /attendance                            5.18 kB         270 kB
├ ƒ /callback                              1.47 kB         203 kB
├ ƒ /classes                               10 kB           163 kB
├ ƒ /dashboard                             4.8 kB          266 kB
├ ƒ /demo                                  3.27 kB         206 kB
├ ƒ /exams                                 9.2 kB          129 kB
├ ƒ /fees                                  5.96 kB         165 kB
├ ƒ /leave-requests                        8.22 kB         161 kB
├ ƒ /login                                 2.81 kB         204 kB
├ ƒ /marks                                 5.41 kB         165 kB
├ ƒ /onboarding                            147 B          87.7 kB
├ ƒ /parent/chat                           3.71 kB         115 kB
├ ƒ /parent/dashboard                      6.66 kB         160 kB
├ ƒ /result                                168 kB          288 kB
├ ƒ /sentry-example-page                   18.6 kB         106 kB
├ ƒ /settings                              4.64 kB         162 kB
├ ƒ /settings/addons                       5.8 kB          150 kB
├ ƒ /settings/billing                      7.17 kB         151 kB
├ ƒ /settings/Curriculum                   5.62 kB         126 kB
├ ƒ /settings/general                      4.64 kB         162 kB
├ ƒ /settings/school-configuration         147 B          87.7 kB
├ ƒ /settings/whitelabel                   2.23 kB         163 kB
├ ƒ /signup                                2.97 kB         204 kB
├ ƒ /staff                                 7.18 kB         175 kB
├ ƒ /staff-attendance                      1.41 kB          89 kB
├ ƒ /staff-profile                         6.84 kB         168 kB
├ ƒ /staff/[id]/edit                       4.57 kB         171 kB
├ ƒ /staff/add                             3.96 kB         171 kB
├ ƒ /staff/departments                     1.33 kB         163 kB
├ ƒ /staff/ocr                             2.67 kB         164 kB
├ ƒ /student-profile                       3.37 kB         163 kB
├ ƒ /students                              3.3 kB          169 kB
├ ƒ /students/[id]                         2.58 kB         162 kB
├ ƒ /students/add                          7.65 kB         133 kB
├ ƒ /students/ocr-admission                4.16 kB         163 kB
├ ƒ /study-center                          1.6 kB          127 kB
├ ƒ /super-admin/analytics                 5.65 kB         227 kB
├ ƒ /super-admin/telemetry                 3.08 kB         224 kB
├ ƒ /syllabus                              1.45 kB         126 kB
├ ƒ /teacher/assignments                   8.93 kB         169 kB
├ ƒ /teacher/assignments/create            9.45 kB         162 kB
├ ƒ /teacher/assignments/submissions       4.19 kB         124 kB
├ ƒ /teacher/behavior                      3.53 kB         163 kB
├ ƒ /teacher/book-center                   8.78 kB         162 kB
├ ƒ /teacher/chat                          4.22 kB         269 kB
├ ƒ /teacher/exam-center                   3.58 kB         115 kB
├ ƒ /teacher/homework                      9.68 kB         163 kB
├ ƒ /teacher/lesson-plans                  9.53 kB         162 kB
├ ƒ /teacher/manage-books                  9.59 kB         163 kB
├ ƒ /teacher/quizzes                       9.81 kB         170 kB
├ ƒ /teacher/quizzes/results               4.27 kB         124 kB
├ ƒ /teacher/skills                        3.55 kB         163 kB
├ ƒ /teacher/video-lectures                1.85 kB         127 kB
├ ƒ /timetable                             9.3 kB          162 kB
└ ƒ /video-lectures                        1.81 kB         127 kB
+ First Load JS shared by all              87.6 kB
  ├ chunks/7023-42a694311e61e458.js        31.6 kB
  ├ chunks/fd9d1056-8f4fb286d28e1600.js    53.7 kB
  └ other shared chunks (total)            2.29 kB


ƒ Middleware                               25.4 kB

ƒ  (Dynamic)  server-rendered on demand


====================================================
7. ROUTES USING REPOSITORIES
====================================================
app/api/v1/configuration/dashboard/route.ts:const configurationRepo = new ConfigurationRepository();
app/api/v1/configuration/dashboard/route.ts:const academicYearRepo = new AcademicYearRepository();
app/api/v1/configuration/dashboard/route.ts:const classRepo = new ClassRepository();
app/api/v1/configuration/dashboard/route.ts:const sectionRepo = new SectionRepository();
app/api/v1/configuration/dashboard/route.ts:const studentRepo = new StudentRepository();
app/api/v1/configuration/dashboard/route.ts:const staffRepo = new StaffRepository();
app/api/v1/configuration/dashboard/route.ts:const parentRepo = new ParentsRepository();
app/api/v1/curriculum/upgrade/route.ts:      const repo = new ConfigurationRepository();
app/api/v1/curriculum/upgrade/route.ts:      const repo = new ConfigurationRepository();
app/api/v1/classes/route.ts:        const sectionRepo = new SectionRepository();
app/api/v1/classes/route.ts:        const sectionRepo = new SectionRepository();
app/api/v1/classes/route.ts:        const sectionRepo = new SectionRepository();
app/api/v1/jobs/attendance-report/route.ts:    const tenantRepo = new TenantRepository();
app/api/v1/jobs/attendance-report/route.ts:      const attendanceService = new AttendanceService(new AttendanceRepository());
app/api/v1/jobs/fee-reminder/route.ts:    const feesRepo = new FeesRepository();
app/api/v1/jobs/fee-reminder/route.ts:    const tenantRepo = new TenantRepository();
app/api/v1/reports/generate/route.tsx:        const student = await (new (await import("@/repositories/student.repository")).StudentRepository()).findById(studentId, tenantId);

====================================================
8. DIRECT FIRESTORE
====================================================
repositories/dashboard-stats.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/base.repository.ts:import { adminDb, dbTimestamp } from '@/lib/firebase-admin';
repositories/base.repository.ts:    this.db = adminDb;
repositories/ledger.repository.ts:import { adminDb } from "@/lib/firebase-admin";
repositories/audit.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/invoice.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/academic-year.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/section.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/section.repository.test.ts:    const sectionCollection = adminDb.collection('sections');
repositories/section.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/section.repository.test.ts:    const sectionDoc = adminDb.collection('sections').doc('section-456');
repositories/section.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/section.repository.test.ts:    const sectionDoc = adminDb.collection('sections').doc('nonexistent');
repositories/section.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/section.repository.test.ts:    const sectionDoc = adminDb.collection('sections').doc('section-789');
repositories/section.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/section.repository.test.ts:    const sectionDoc = adminDb.collection('sections').doc('nonexistent');
repositories/section.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/section.repository.test.ts:    const sectionDoc = adminDb.collection('sections').doc('section-111');
repositories/job.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/job.repository.test.ts:    const targetCollection = adminDb.collection('tenants').doc(tenantId).collection('jobs');
repositories/job.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/job.repository.test.ts:    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-456');
repositories/job.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/job.repository.test.ts:    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('nonexistent');
repositories/job.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/job.repository.test.ts:    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-789');
repositories/job.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/job.repository.test.ts:    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-789');
repositories/job.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/job.repository.test.ts:    const jobDoc = adminDb.collection('tenants').doc(tenantId).collection('jobs').doc('job-999');
repositories/academic-year.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/academic-year.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/academic-year.repository.test.ts:    const { adminDb, mockCollection, mockBatch, mockDocRef } = require('@/lib/firebase-admin');
repositories/section.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/audit.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/tenant-setup.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/tenant-setup.repository.ts:    const batch = adminDb.batch();
repositories/tenant-setup.repository.ts:    const userRef = adminDb.collection("users").doc(userId);
repositories/tenant-setup.repository.ts:    const tenantRef = adminDb.collection("tenants").doc(tenantId);
repositories/tenant-setup.repository.ts:    const settingsRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config");
repositories/tenant-setup.repository.ts:    const sectionsRef = adminDb.collection("sections");
repositories/tenant-setup.repository.ts:      const deptRef = adminDb.collection("departments").doc();
repositories/tenant-setup.repository.ts:      const desigRef = adminDb.collection("designations").doc();
repositories/tenant-setup.repository.ts:    const campusRef = adminDb.collection("campuses").doc();
repositories/attendance.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/attendance.repository.test.ts:    const { adminDb, mockBatch } = require('@/lib/firebase-admin');
repositories/tenant.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/syllabus.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/configuration.repository.ts:import { adminDb } from "@/lib/firebase-admin";
repositories/configuration.repository.ts:    return adminDb.collection("tenants").doc(tenantId).collection("settings");
repositories/behavior.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/addons.repository.test.ts:    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
repositories/addons.repository.test.ts:    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
repositories/addons.repository.test.ts:    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
repositories/addons.repository.test.ts:    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
repositories/addons.repository.test.ts:    const { adminDb, mockDocRef } = require('@/lib/firebase-admin');
repositories/student.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    adminDb: {
repositories/settings.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
repositories/settings.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
repositories/settings.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
repositories/settings.repository.test.ts:    const { adminDb, mockQuery } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
repositories/settings.repository.test.ts:    const { adminDb, mockBatch } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const configDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('config');
repositories/settings.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const generalDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general');
repositories/settings.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const generalDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general');
repositories/settings.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/settings.repository.test.ts:    const generalDoc = adminDb.collection('tenants').doc(tenantId).collection('settings').doc('general');
repositories/assignment.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/bus.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/bus.repository.test.ts:    const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
repositories/event-outbox.repository.ts:import { adminDb } from "@/lib/firebase-admin";
repositories/event-outbox.repository.ts:  private readonly events = adminDb.collection("events");
repositories/event-outbox.repository.ts:    const claimed = await Promise.all(candidates.map(async (candidate) => adminDb.runTransaction(async (transaction) => {
repositories/event-outbox.repository.ts:      await adminDb.runTransaction(async (transaction) => {
repositories/event-outbox.repository.ts:        const deadLetterRef = adminDb.collection("dead_letter_events").doc(event.eventId);
repositories/event-outbox.repository.ts:    const ref = adminDb.collection("processed_events").doc(`${eventId}_${subscriberId}`);
repositories/event-outbox.repository.ts:    return adminDb.runTransaction(async (transaction) => {
repositories/event-outbox.repository.ts:    await adminDb.collection("processed_events").doc(`${eventId}_${subscriberId}`).update({
repositories/event-outbox.repository.ts:    await adminDb.collection("processed_events").doc(`${eventId}_${subscriberId}`).delete();
repositories/assignment.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/subscription.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/event-outbox.repository.test.ts:    const { adminDb, mockCollection, mockDocRef, mockQuery } = require('@/lib/firebase-admin');
repositories/event-outbox.repository.test.ts:    adminDb.collection.mockReturnValue(mockCollection);
repositories/event-outbox.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/event-outbox.repository.test.ts:    adminDb.runTransaction.mockResolvedValue(true);
repositories/event-outbox.repository.test.ts:    const { adminDb, mockCollection, mockDocRef } = require('@/lib/firebase-admin');
repositories/event-outbox.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const quizCollection = adminDb.collection('quizzes');
repositories/quiz.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const quizDoc = adminDb.collection('quizzes').doc('quiz-456');
repositories/quiz.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const quizDoc = adminDb.collection('quizzes').doc('nonexistent');
repositories/quiz.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const quizDoc = adminDb.collection('quizzes').doc('quiz-789');
repositories/quiz.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const quizDoc = adminDb.collection('quizzes').doc('quiz-999');
repositories/quiz.repository.test.ts:    const { adminDb } = require('@/lib/firebase-admin');
repositories/quiz.repository.test.ts:    const subCollection = adminDb.collection('quiz_submissions');
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/configuration.repository.test.ts:      const { adminDb } = require('@/lib/firebase-admin');
repositories/configuration.repository.test.ts:      adminDb.collection.mockReturnValue({
repositories/ai-usage.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/book.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/base.repository.test.ts:    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
repositories/base.repository.test.ts:    const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
repositories/class.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
repositories/ai-usage.repository.ts:import { adminDb, dbTimestamp } from "@/lib/firebase-admin";

====================================================
9. SERVICES IMPLEMENTING INTERFACES
====================================================
services/homework.service.ts:export class HomeworkService implements IHomeworkService {
services/behavior.service.ts:export class BehaviorService implements IBehaviorService {
services/lesson-plan.service.ts:export class LessonPlanService implements ILessonPlanService {
services/subscription.service.ts:export class SubscriptionService implements ISubscriptionService {
services/marks.service.ts:export class MarksService implements IMarksService {
services/auth.service.ts:export class AuthService implements IAuthService {
services/dashboard.service.ts:export class DashboardService implements IDashboardService {
services/bus.service.ts:export class BusService implements IBusService {
services/fees.service.ts:export class FeesService implements IFeesService {
services/claims.service.ts:export class ClaimsService implements IClaimsService {
services/tenant.resolver.ts:export class TenantResolver implements ITenantResolver {
services/tenant-branding.service.ts:export class TenantBrandingService implements ITenantBrandingService {
services/curriculum-engine.service.ts:export class CurriculumEngineService implements ICurriculumEngineService {
services/configuration.service.ts:export class ConfigurationService implements IConfigurationService {
services/book.service.ts:export class BookService implements IBookService {
services/video-lecture.service.ts:export class VideoLectureService implements IVideoLectureService {
services/parents.service.ts:export class ParentsService implements IParentService {
services/invoice.service.ts:export class InvoiceService implements IInvoiceService {
services/configuration-cache.service.ts:export class ConfigurationCacheService implements IConfigurationCacheService {
services/configuration-health.service.ts:export class ConfigurationHealthService implements IConfigurationHealthService {
services/quiz.service.ts:export class QuizService implements IQuizService {
services/ai/exam.service.ts:export class ExamService implements IAIExamService {
services/ai/timetable.service.ts:export class TimetableService implements IAITimetableService {
services/session.service.ts:export class SessionService implements ISessionService {
services/report.service.ts:export class ReportService implements IReportService {
services/featureFlag.service.ts:export class FeatureFlagService implements IFeatureFlagService {
services/timetable.service.ts:export class TimetableService implements ITimetableService {
services/job.service.ts:export class JobService implements IJobService {
services/OCRService.ts:export class OCRService implements IOCRService {
services/ValidationService.ts:export class ValidationService implements IValidationService {
services/tenant.service.ts:export class TenantService implements ITenantService {
services/telemetry.service.ts:export class TelemetryService implements ITelemetryService {
services/analytics.service.ts:export class AnalyticsService implements IAnalyticsService {
services/menu.service.ts:export class MenuService implements IMenuService {
services/attendance.service.ts:export class AttendanceService implements IAttendanceService {
services/assignment.service.ts:export class AssignmentService implements IAssignmentService {
services/class.service.ts:export class ClassService implements IClassService {
services/StudentService.ts:export class StudentService implements IStudentService {
services/StaffService.ts:export class StaffService implements IStaffService {
services/AuditService.ts:export class AuditService implements IAuditService {

====================================================
10. REPOSITORIES EXTENDING BASEREPOSITORY
====================================================
repositories/dashboard-stats.repository.ts:export class DashboardStatsRepository extends BaseRepository<DashboardStats> implements IDashboardStatsRepository {
repositories/room.repository.ts:export class RoomRepository extends BaseRepository<RoomDocument> implements IRoomRepository {
repositories/marks.repository.ts:export class MarksRepository extends BaseRepository<Mark> implements IMarksRepository {
repositories/fees.repository.ts:export class FeesRepository extends BaseRepository<FeeDocument> implements IFeesRepository {
repositories/settings.repository.ts:export class SettingsRepository extends BaseRepository<any> implements ISettingsRepository {
repositories/ledger.repository.ts:export class LedgerRepository extends BaseRepository<LedgerEntry> implements ILedgerRepository {
repositories/audit.repository.ts:export class AuditRepository extends BaseRepository<AuditLog> implements IAuditRepository {
repositories/quiz.repository.ts:export class QuizRepository extends BaseRepository<Quiz> implements IQuizRepository {
repositories/hostel.repository.ts:export class HostelRepository extends BaseRepository<HostelDocument> implements IHostelRepository {
repositories/department.repository.ts:export class DepartmentRepository extends BaseRepository<DepartmentDocument> implements IDepartmentRepository {
repositories/video-lecture.repository.ts:export class VideoLectureRepository extends BaseRepository<VideoLecture> implements IVideoLectureRepository {
repositories/job.repository.ts:export class JobRepository extends BaseRepository<Job> implements IJobRepository {
repositories/invoice.repository.ts:export class InvoiceRepository extends BaseRepository<Invoice> implements IInvoiceRepository {
repositories/academic-year.repository.ts:export class AcademicYearRepository extends BaseRepository<AcademicYear> implements IAcademicYearRepository {
repositories/behavior.repository.ts:export class BehaviorRepository extends BaseRepository<BehaviorLog> implements IBehaviorRepository {
repositories/section.repository.ts:export class SectionRepository extends BaseRepository<Section> implements ISectionRepository {
repositories/tenant.repository.ts:export class TenantRepository extends BaseRepository<Tenant> implements ITenantRepository {
repositories/library.repository.ts:export class LibraryRepository extends BaseRepository<LibraryDocument> implements ILibraryRepository {
repositories/grading.repository.ts:export class GradingRepository extends BaseRepository<GradingDocument> implements IGradingRepository {
repositories/parents.repository.ts:export class ParentsRepository extends BaseRepository<ParentDocument> implements IParentsRepository {
repositories/syllabus.repository.ts:export class SyllabusRepository extends BaseRepository<Syllabus> implements ISyllabusRepository {
repositories/staff.repository.ts:export class StaffRepository extends BaseRepository<StaffDocument> implements IStaffRepository {
repositories/fee-structure.repository.ts:export class FeeStructureRepository extends BaseRepository<FeeStructureDocument> implements IFeeStructureRepository {
repositories/homework.repository.ts:export class HomeworkRepository extends BaseRepository<Homework> implements IHomeworkRepository {
repositories/transport.repository.ts:export class TransportRepository extends BaseRepository<TransportDocument> implements ITransportRepository {
repositories/lesson-plan.repository.ts:export class LessonPlanRepository extends BaseRepository<LessonPlan> implements ILessonPlanRepository {
repositories/building.repository.ts:export class BuildingRepository extends BaseRepository<BuildingDocument> implements IBuildingRepository {
repositories/menu.repository.ts:export class MenuRepository extends BaseRepository<any> implements IMenuRepository {
repositories/feature-flag.repository.ts:export class FeatureFlagRepository extends BaseRepository<any> implements IFeatureFlagRepository {
repositories/addons.repository.ts:export class AddonsRepository extends BaseRepository<any> implements IAddonsRepository {
repositories/leave.repository.ts:export class LeaveRepository extends BaseRepository<LeaveRequest> implements ILeaveRepository {
repositories/user.repository.ts:export class UserRepository extends BaseRepository<any> implements IUserRepository {
repositories/shift.repository.ts:export class ShiftRepository extends BaseRepository<ShiftDocument> implements IShiftRepository {
repositories/bus.repository.ts:export class BusRepository extends BaseRepository<Bus> implements IBusRepository {
repositories/tenant-branding.repository.ts:export class TenantBrandingRepository extends BaseRepository<TenantBranding> implements ITenantBrandingRepository {
repositories/assignment.repository.ts:export class AssignmentRepository extends BaseRepository<Assignment> implements IAssignmentRepository {
repositories/attendance.repository.ts:export class AttendanceRepository extends BaseRepository<AttendanceDocument> implements IAttendanceRepository {
repositories/chat.repository.ts:export class ChatRepository extends BaseRepository<ChatMessage> implements IChatRepository {
repositories/house.repository.ts:export class HouseRepository extends BaseRepository<HouseDocument> implements IHouseRepository {
repositories/student.repository.ts:export class StudentRepository extends BaseRepository<StudentDocument> implements IStudentRepository
repositories/subscription.repository.ts:export class SubscriptionRepository extends BaseRepository<Subscription> implements ISubscriptionRepository {
repositories/timetable.repository.ts:export class TimetableRepository extends BaseRepository<TimetableEntry> implements ITimetableRepository {
repositories/book.repository.ts:export class BookRepository extends BaseRepository<Book> implements IBookRepository {
repositories/class.repository.ts:export class ClassRepository extends BaseRepository<ClassRecord> implements IClassRepository {
repositories/ai-usage.repository.ts:export class AiUsageRepository extends BaseRepository<AiUsage> implements IAiUsageRepository {
repositories/facility.repository.ts:export class FacilityRepository extends BaseRepository<FacilityDocument> implements IFacilityRepository {

====================================================
11. SINGLETON EXPORTS
====================================================
services/configuration-modules.service.ts:export const configurationModulesService = new ConfigurationModulesService();
services/tenant.resolver.ts:export const tenantResolver = new TenantResolver();
services/curriculum-engine.service.ts:export const curriculumEngine = new CurriculumEngineService();
services/configuration.service.ts:export const configurationService = new ConfigurationService();
services/configuration-cache.service.ts:export const configurationCacheService = new ConfigurationCacheService();
services/menu.service.ts:export const menuService = new MenuService();
services/class.service.ts:export const classService = new ClassService();
repositories/class.repository.ts:export const classRepository = new ClassRepository();

====================================================
12. ROUTES CALLING FIRESTORE DIRECTLY
====================================================

====================================================
13. SERVICES CALLING FIRESTORE DIRECTLY
====================================================

====================================================
14. TODO / FIXME
====================================================

====================================================
15. CIRCULAR DEPENDENCIES
====================================================
- Finding files
Processed 0 files (714ms) 

✔ No circular dependency found!


====================================================
16. UNUSED EXPORTS
====================================================
Need to install the following packages:
ts-prune@0.10.3
Ok to proceed? (y) 