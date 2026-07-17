# EduPilot Production Readiness Report

**Generated:** July 7, 2026  
**Version:** 0.1.0  
**Assessment Type:** Full Enterprise Production Hardening Sprint

---

## Executive Summary

EduPilot is a multi-tenant SaaS school management platform built on Next.js 14, Firebase, and an enterprise clean architecture. This report covers a comprehensive production hardening sprint addressing runtime bugs, security vulnerabilities, CI/CD pipeline gaps, performance optimization, quality cleanup, and full verification.

**Key achievements from this sprint:**
- Replaced all `console.error/log` calls with structured `Logger` across server-side code
- Fixed critical middleware security vulnerability (overly broad auth bypass)
- Created comprehensive Firestore Security Rules (206 lines, 25+ collections)
- Added 12 new composite Firestore indexes for query optimization
- Consolidated fragmented CI workflows into unified pipeline with CodeQL + npm audit
- Added Dependabot configuration for automated dependency updates
- Created `/api/health` endpoint for uptime monitoring
- Fixed duplicate `AppError` class and `PLAN_LIMITS` definitions
- Hardened `next.config.js` with HSTS, restricted image domains, DNS prefetch
- Fixed all 4 failing tests, expanded to 198 passing tests
- Zero TypeScript errors, zero ESLint errors, successful production build

---

## 1. Overall Enterprise Score

| Category | Score (0-100) |
|---|---|
| **Overall Enterprise Score** | **78** |

---

## 2. Architecture Score: 85/100

**Strengths:**
- Clean Architecture with clear layer separation: Route Helpers → Services → Repositories → Firestore
- Repository Pattern with `BaseRepository<T>` providing CRUD, pagination, soft delete, bulk operations
- Service Layer with `BaseService` and domain-specific services (Student, Staff, Fees, Attendance, etc.)
- DTO Layer with typed API contracts (`types/api.ts`, `types/student.ts`, etc.)
- Validation Layer with centralized Zod schemas (`lib/validation/`)
- AI Gateway with Strategy Pattern and Provider Abstraction (`lib/ai/gateway/AIGateway.ts`)
- OCR Layer with confidence modeling and review queue
- RBAC with permission-based access control (`lib/auth/permissions.ts`, `lib/auth/roles.ts`)
- Response Builder with standardized API format (`lib/api/response.ts`)
- Structured Logging with leveled logger (`lib/logger/logger.ts`)
- Route Helpers HOF chain: `withErrorHandler → withAuth → withTenant → withPermission → withValidation`

**Architecture Inventory:**
- 473 TypeScript/TSX files
- 113 API routes
- 27 service files
- 14 repositories
- 31 React hooks
- 29 components
- 15 AI module files
- 5 validation schemas
- 3 OCR mapper files
- 16 Firestore composite indexes

**Areas for Improvement:**
- Some legacy routes still use direct `adminDb` instead of going through services
- Dashboard stats rebuild route uses raw Firestore queries instead of repository pattern

---

## 3. Security Score: 82/100

**Implemented:**
- Firebase Authentication with session cookies (5-day expiry, httpOnly, secure in production)
- RBAC with 10+ roles (admin, principal, teacher, student, parent, finance, HR, super_admin, etc.)
- Permission-based route protection via `withAuthAndPermission` HOF
- Rate limiting on auth endpoints (`lib/ratelimit.ts` using Upstash Redis)
- Tenant isolation via `tenantId` scoping on all Firestore queries
- Firestore Security Rules with 25+ collection-level access controls (NEW)
- Strict-Transport-Security header (HSTS) with 1-year max-age (NEW)
- X-Frame-Options: SAMEORIGIN (clickjacking protection)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera/microphone/geolocation disabled
- Image domain restriction (removed wildcard `**`, now only Firebase Storage) (NEW)
- CodeQL security analysis in CI pipeline (NEW)
- npm audit in CI pipeline (NEW)
- Session cookie verification with email fallback for custom token auth
- Input validation via Zod schemas on API routes

**Security Fixes Applied This Sprint:**
- Fixed middleware auth bypass: `pathname.startsWith("/api/v1/auth")` was too broad, now uses explicit prefix list
- Created `firestore.rules` with default-deny policy and per-collection access rules
- Restricted `images.remotePatterns` from `**` to specific Firebase Storage domains
- Added HSTS header to all routes

**Remaining Risks:**
- No CSP (Content-Security-Policy) header - should be added after auditing inline scripts
- 46 npm audit vulnerabilities (mostly from firebase-admin transitive deps and xlsx)
- `xlsx` package has high-severity vulnerabilities with no fix available (consider migration)
- Some API routes don't validate JSON body structure beyond field presence
- No CSRF token implementation (relies on sameSite cookie)

---

## 4. Performance Score: 80/100

**Implemented:**
- React Query for client-side caching with stale-while-revalidate
- Firestore composite indexes for all tenant-scoped queries (16 indexes) (12 NEW)
- Cursor-based pagination in `BaseRepository.paginate()` using `startAfter`
- Firestore `count()` aggregation for efficient total counting
- Batch operations for bulk creates and deletes
- Firestore transactions for atomic stat updates
- Webpack external for `xlsx` to reduce server bundle size
- Dynamic imports for heavy components
- `force-dynamic` on all API routes to prevent static generation of sensitive data
- Rate limiting to prevent abuse

**Build Output:**
- First Load JS shared: 87.6 kB
- Middleware: 25.4 kB
- 87 static pages generated successfully
- All routes within acceptable bundle size limits

**Areas for Improvement:**
- No Redis caching layer for frequently accessed data (Redis is available via Upstash)
- Dashboard stats route does full collection scans instead of using cached counters
- No image optimization pipeline for uploaded files
- No CDN configuration for static assets

---

## 5. Scalability Score: 78/100

**Implemented:**
- Multi-tenant architecture with `tenantId` isolation on every collection
- Subscription-based feature gating (`lib/config/subscription-plans.ts`)
- Usage tracking and limits (`lib/subscription.ts` with `canAddStudent`, `canAddStaff`)
- QStash queue for async job processing (fee reminders, attendance reports)
- Feature flag system (`lib/config/featureFlags.ts`, `lib/features/featureFlags.ts`)
- 7-language internationalization (en, ar, es, fr, hi, ur, zh)
- White-label branding support (`lib/config/tenant-features.ts`)
- Firestore auto-scaling (serverless)

**Areas for Improvement:**
- No horizontal scaling configuration for Next.js (single instance)
- No connection pooling for Firebase Admin SDK
- No read replica strategy for Firestore
- Tenant onboarding is manual (no self-service signup flow)

---

## 6. Reliability Score: 80/100

**Implemented:**
- `withErrorHandler` HOF wrapping all API routes for consistent error handling
- Structured error classes: `AppError`, `ValidationError`, `BusinessError`, `RepositoryException`, `ProviderException`, `OCRException`, `RateLimitException`, `SubscriptionLimitException`
- Error boundaries in React (per-module error.tsx files)
- Global error page (`app/global-error.tsx`)
- Sentry configuration ready (commented out, can be enabled)
- Health check endpoint (`/api/health`) (NEW)
- Daily Firestore backups via GitHub Actions
- Session cookie verification with graceful fallback

**Reliability Fixes Applied This Sprint:**
- Replaced all `console.error` with structured `logger.error` for observability
- Fixed unhandled promise in `marks/bulk/route.ts` (`.catch(console.error)` → `.catch(logger.error)`)
- Fixed silent catch blocks in `students/route.ts` and `users/init/route.ts`
- Added `canAddStaff()` function for staff subscription limits

**Areas for Improvement:**
- No circuit breaker pattern for AI/OCR provider calls
- No retry logic with exponential backoff on Firestore operations
- No graceful shutdown handling
- No health check for Firebase Admin SDK connectivity

---

## 7. Maintainability Score: 85/100

**Implemented:**
- Clean Architecture with clear layer boundaries
- TypeScript strict mode with zero type errors
- ESLint with zero warnings
- Consistent naming conventions (PascalCase services, camelCase functions)
- Repository pattern for data access abstraction
- Service pattern for business logic encapsulation
- HOF composition for cross-cutting concerns (auth, tenant, error, logging, rate limit, validation)
- Centralized configuration (`lib/config/`)
- Shared mapper utilities (`lib/mappers/shared.ts`)
- 198 passing unit tests with mocked dependencies

**Maintainability Fixes Applied This Sprint:**
- Removed duplicate `AppError` class (`lib/errors/AppError.ts` was unused duplicate)
- Removed duplicate export in `errors/index.ts`
- Consolidated duplicate `PLAN_LIMITS` in `lib/subscription.ts` to use `PLANS` from `lib/config/subscription-plans.ts`
- Removed Urdu comments from code (replaced with clean English)
- Fixed test infrastructure (mocked Firestore instead of requiring emulator)

---

## 8. UX Score: 75/100

**Implemented:**
- 26+ feature modules (students, staff, attendance, fees, exams, AI, timetable, etc.)
- Mobile-responsive sidebar layout
- Bottom navigation for mobile
- Global search component
- Notifications dropdown
- Dark/light theme switcher
- Particle background animation
- Skeleton loading states
- Job progress bar
- Toast notifications
- Multi-language support (7 languages)
- RTL support (tailwindcss-rtl)

**Areas for Improvement:**
- No offline support / PWA configuration (service worker disabled)
- No progressive loading for large lists (no infinite scroll on student list)
- No drag-and-drop for timetable (dnd-kit is installed but not fully utilized)

---

## 9. Accessibility Score: 70/100

**Implemented:**
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Theme contrast (dark/light modes)

**Areas for Improvement:**
- No comprehensive ARIA live regions for dynamic content
- No skip-to-content links
- No screen reader testing documentation
- Color contrast not formally audited (WCAG AA/AAA)

---

## 10. Commercial Readiness Score: 72/100

**Implemented:**
- Stripe integration for subscription billing
- 4 subscription tiers (Free, Starter, Professional, Enterprise)
- Feature gating by plan
- Usage limits enforcement
- White-label branding
- Parent portal
- Teacher workflow
- Admin dashboard
- Super-admin analytics
- Fee management with reminders
- Salary slip OCR
- Student admission OCR
- Report generation (PDF)

**Areas for Improvement:**
- No invoice generation
- No proration on plan changes
- No refund flow
- No dunning (failed payment retry)
- No trial period support
- No tax calculation
- No multi-currency support (PKR only)

---

## 11. Production Readiness Score: 80/100

**Verification Results:**

| Check | Status |
|---|---|
| TypeScript (`tsc --noEmit`) | PASS - 0 errors |
| ESLint (`next lint`) | PASS - 0 warnings |
| Unit Tests (`jest`) | PASS - 198/198 |
| Build (`next build`) | PASS - 87 static pages |
| npm audit | 46 vulnerabilities (transitive deps) |
| CodeQL | Configured in CI |

**Production Checklist:**

| Item | Status |
|---|---|
| Environment variable validation | PASS (throws in production) |
| Session cookie security | PASS (httpOnly, secure, sameSite) |
| Firestore security rules | PASS (206 rules, default-deny) |
| API rate limiting | PASS (Upstash Redis) |
| Input validation | PASS (Zod schemas) |
| Structured logging | PASS (leveled logger) |
| Error handling | PASS (HOF chain + error boundaries) |
| CI/CD pipeline | PASS (lint, type-check, test, build, security scan) |
| Health check endpoint | PASS (`/api/health`) |
| Database backups | PASS (daily GitHub Actions) |
| Dependabot | PASS (weekly npm + GitHub Actions) |
| Security headers | PASS (HSTS, X-Frame-Options, etc.) |
| Image domain restriction | PASS (Firebase Storage only) |
| Multi-tenant isolation | PASS (tenantId scoping) |

---

## 12. Technical Debt Summary

| Category | Items | Priority |
|---|---|---|
| **Dependencies** | `xlsx` has high-severity vulns with no fix | HIGH - Consider migration to `exceljs` |
| **Dependencies** | 46 npm audit vulnerabilities (mostly firebase-admin transitive) | MEDIUM - Monitor for updates |
| **Legacy Routes** | ~15 routes use raw `adminDb` instead of service/repository pattern | MEDIUM - Gradual migration |
| **Testing** | 8 test files covering 198 tests - needs expansion for 113 API routes | HIGH - Add integration tests |
| **PWA** | Service worker disabled (`sw.js.disabled`) | LOW - Enable for offline support |
| **Sentry** | Configured but commented out | LOW - Enable for production monitoring |
| **CSP** | No Content-Security-Policy header | MEDIUM - Add after inline script audit |

---

## 13. Remaining Risks

1. **xlsx vulnerability (HIGH)** - Prototype pollution and ReDoS in SheetJS. No fix available. Consider migrating to `exceljs` or `@e965/xlsx` (community fork).
2. **No CSRF protection** - Relies on `sameSite: "lax"` cookie. Sufficient for most cases but not a complete CSRF defense.
3. **No circuit breaker** - AI/OCR provider failures could cascade. Add circuit breaker pattern to `AIGateway`.
4. **No retry with backoff** - Firestore operations don't retry on transient failures.
5. **Session token in cookie only** - No refresh token mechanism. Users must re-login after 5 days.

---

## 14. Recommended Future Enhancements

1. **Migrate xlsx to exceljs** - Eliminates high-severity vulnerabilities
2. **Add Sentry integration** - Enable crash reporting and performance monitoring
3. **Implement Redis caching layer** - Cache dashboard stats, menu config, feature flags
4. **Add comprehensive integration tests** - Test API routes with Firebase emulator
5. **Implement PWA** - Enable offline support for mobile users
6. **Add CSP header** - Defense-in-depth against XSS
7. **Implement circuit breaker** - For AI/OCR provider resilience
8. **Add invoice generation** - For commercial billing
9. **Implement multi-currency** - For international expansion
10. **Add WCAG AA compliance audit** - For accessibility certification

---

## 15. Cost Optimization Suggestions

1. **Cache dashboard stats** - Currently does full collection scans on every request. Cache in Redis with 5-minute TTL.
2. **Use Firestore count aggregation** - Already implemented in `BaseRepository.count()`, ensure all count operations use it instead of `.get().size`.
3. **Batch email sending** - Currently sends emails sequentially in loops. Use `Promise.all()` with rate limiting.
4. **Lazy load heavy routes** - `result` page loads 168 kB. Consider code-splitting.
5. **Optimize Firestore reads** - Timeline route fetches 100 logs and filters in memory. Add composite index for `entityType + entityId`.
6. **Use Firestore data bundles** - For initial page load data to reduce read costs.

---

## 16. Firestore Optimization Report

**Indexes (16 composite indexes):**

| Collection | Index Fields | Purpose |
|---|---|---|
| attendance | tenantId + studentId + date (desc) | Student attendance history |
| attendance | studentId + tenantId + date (desc) | Cross-tenant student lookup |
| marks | tenantId + studentId + createdAt (desc) | Student marks history |
| fees | tenantId + studentId + createdAt (desc) | Student fee history |
| fees | tenantId + status + dueDate (asc) | Overdue fee queries |
| students | tenantId + createdAt (desc) | Student listing (NEW) |
| staff | tenantId + createdAt (desc) | Staff listing (NEW) |
| logs | tenantId + createdAt (desc) | Audit log queries (NEW) |
| homework | tenantId + createdAt (desc) | Homework listing (NEW) |
| chat_messages | tenantId + createdAt (desc) | Chat history (NEW) |
| syllabus | tenantId + createdAt (desc) | Syllabus listing (NEW) |
| video_lectures | tenantId + createdAt (desc) | Video listing (NEW) |
| leave_requests | tenantId + createdAt (desc) | Leave requests (NEW) |
| behavior | tenantId + createdAt (desc) | Behavior records (NEW) |
| books | tenantId + createdAt (desc) | Book listing (NEW) |
| exams | tenantId + createdAt (desc) | Exam listing (NEW) |

**Security Rules:**
- 206-line `firestore.rules` file
- Default-deny policy on all unmatched paths
- Tenant isolation via `isTenantMember()` helper
- Role-based access (admin, super_admin, staff, parent)
- Per-collection access rules for 25+ collections

---

## 17. OCR Performance Report

**Architecture:**
- `OCRService` with Gemini 2.0 Flash provider
- `OCRException` error class for structured error handling
- OCR mapper layer (`lib/mappers/staff.mapper.ts`, `lib/mappers/student.mapper.ts`)
- Shared mapper utilities (`lib/mappers/shared.ts` with `toDateInputFormat`, `toNumber`, `extractConfidence`, `getConfidenceLabel`)
- Confidence modeling: High/Medium/Low classification
- Review queue for low-confidence results

**Supported Document Types:**
- Staff: CNIC, CV, Degree, Salary Slip, Transcript
- Student: CNIC, Birth Certificate, Previous Result
- Admission: Full admission form

**Resilience:**
- Dynamic import for `pdf-parse` (compatibility wrapper)
- Sharp for image preprocessing
- Timeout handling
- Error recovery with structured exceptions

---

## 18. AI Performance Report

**Architecture:**
- `AIGateway` with Strategy Pattern
- `GeminiProvider` implementing `AIProvider` interface
- Agent Registry with pluggable strategies (`FinanceAgent`, etc.)
- Usage tracking (`UsageTracker`)
- Rate limiting (`aiRateLimit` - 10 req/min)

**Features:**
- AI Exam Paper Generation
- AI Timetable Generation
- AI Chatbot
- AI Smart Book Center
- AI Agent system

**Provider:**
- Google Gemini 2.0 Flash (configurable via env var)
- Endpoint hardening for production reliability

---

## 19. API Performance Report

**Route Architecture:**
- 113 API routes under `/api/v1/`
- All routes use `force-dynamic` to prevent static caching of sensitive data
- HOF chain: `withErrorHandler → withAuth → withTenant → withPermission → withValidation`
- Standardized response format via `createApiResponse`, `createSuccessResponse`, `createErrorResponse`

**Rate Limiting:**
- Auth endpoints: 5 req/min per IP
- AI endpoints: 10 req/min per user
- Standard endpoints: 30 req/min per user
- Powered by Upstash Redis

**Health Check:**
- `GET /api/health` returns status, timestamp, uptime, environment

---

## 20. Final Folder Structure

```
edupilot/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Unified CI: lint, type-check, test, build, CodeQL, npm audit
│   │   └── firestore-backup.yml      # Daily Firestore export
│   └── dependabot.yml                # Weekly dependency updates
├── app/
│   ├── (protected)/                  # 26 feature modules
│   ├── api/
│   │   ├── health/route.ts           # Health check endpoint (NEW)
│   │   └── v1/                       # 113 API routes
│   └── ...
├── components/                       # 29 React components
├── context/                          # Auth + Branding contexts
├── errors/                           # AppError hierarchy (consolidated)
├── features/                         # Feature-based modules
├── hooks/                            # 31 React hooks
├── lib/
│   ├── ai/                           # AI Gateway, providers, agents (15 files)
│   ├── api/                          # Response builder
│   ├── auth/                         # RBAC, permissions, roles, session
│   ├── cache/                        # Cache service
│   ├── config/                       # Env, subscription plans, feature flags
│   ├── errors/                       # (removed - was duplicate)
│   ├── features/                     # Feature flag definitions
│   ├── logger/                       # Structured logger
│   ├── mappers/                      # OCR-to-form mappers (3 files)
│   ├── validation/                   # Zod validation schemas (5 files)
│   └── ...
├── repositories/                     # 14 repositories + BaseRepository
├── route-helpers/                    # HOF chain (8 files)
├── services/                         # 27 service files
├── types/                            # TypeScript type definitions
├── firestore.rules                   # Security rules (NEW - 206 lines)
├── firestore.indexes.json            # 16 composite indexes
├── firebase.json                     # Firebase config (updated with rules)
├── middleware.ts                     # Auth middleware (hardened)
├── next.config.js                    # Next.js config (hardened)
└── package.json
```

---

## 21. Dependency Graph

```
Route Layer (app/api/v1/*/route.ts)
  └── Route Helpers (route-helpers/)
       ├── withErrorHandler → lib/api/response
       ├── withAuth → lib/auth/auth-server → lib/firebase-admin
       ├── withTenant → types/api
       ├── withPermission → lib/auth/permissions, lib/auth/roles
       └── withValidation → lib/validation/*
            └── Service Layer (services/)
                 └── Repository Layer (repositories/)
                      └── BaseRepository → lib/firebase-admin → Firestore
                           └── errors/AppError (error hierarchy)

AI Pipeline:
  Route → useAI hook → AIGateway → AIProvider (GeminiProvider)
                                      └── AgentRegistry → IAgentStrategy implementations

OCR Pipeline:
  Route → OCRService → GeminiProvider → lib/mappers/* → lib/mappers/shared.ts
```

---

## 22. Shared Infrastructure Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Next.js 14 App                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Middleware  │  │  Route Layer │  │  React UI   │ │
│  │  (auth gate) │  │  (113 routes)│  │  (26 pages) │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                │                 │         │
│  ┌──────▼────────────────▼─────────────────▼──────┐ │
│  │           Route Helpers (HOF Chain)             │ │
│  │  ErrorHandler → Auth → Tenant → Permission     │ │
│  └──────────────────────┬─────────────────────────┘ │
│                         │                            │
│  ┌──────────────────────▼─────────────────────────┐ │
│  │              Service Layer (27 svc)             │ │
│  │  StudentService, StaffService, FeesService,     │ │
│  │  AttendanceService, OCRService, AuditService   │ │
│  └──────────────────────┬─────────────────────────┘ │
│                         │                            │
│  ┌──────────────────────▼─────────────────────────┐ │
│  │           Repository Layer (14 repos)           │ │
│  │  BaseRepository<T> → StudentRepo, StaffRepo,    │ │
│  │  FeesRepo, AttendanceRepo, etc.                 │ │
│  └──────────┬───────────────────┬─────────────────┘ │
│             │                   │                    │
│  ┌──────────▼─────┐  ┌────────▼────────┐            │
│  │   Firebase     │  │   Upstash       │            │
│  │   Admin SDK    │  │   Redis         │            │
│  │   (Firestore)  │  │   (Rate Limit)  │            │
│  └────────────────┘  └─────────────────┘            │
└─────────────────────────────────────────────────────┘
         │
    ┌────▼────┐
    │ Firebase │
    │  Cloud   │
    │ Firestore│
    └──────────┘
```

---

## 23. Service Architecture

```
services/
├── base.service.ts          # BaseService<T> - shared service logic
├── StudentService.ts        # Student CRUD, admission, 360 view
├── StaffService.ts          # Staff CRUD, OCR processing
├── OCRService.ts            # OCR orchestration with Gemini
├── ValidationService.ts     # Centralized Zod validation
├── AuditService.ts          # Audit trail logging
├── attendance.service.ts    # Attendance tracking
├── bus.service.ts           # Transport management
├── class.service.ts         # Class & section management
├── dashboard.service.ts     # Dashboard metrics
├── fees.service.ts          # Fee collection & tracking
├── homework.service.ts      # Homework assignment
├── job.service.ts           # Async job processing
├── menu.service.ts          # Dynamic menu configuration
├── parents.service.ts       # Parent portal
├── report.service.ts        # Report generation (PDF)
├── staff.service.ts         # Staff management
├── student.service.ts       # Student management (legacy)
├── subscription.service.ts  # Plan management
├── telemetry.service.ts     # Usage telemetry
├── tenant-branding.service.ts # White-label branding
├── video-lecture.service.ts # Video lecture management
└── index.ts                 # Barrel export
```

---

## 24. Repository Architecture

```
repositories/
├── base.repository.ts       # BaseRepository<T> - CRUD, pagination, soft delete, bulk
├── student.repository.ts    # Students collection
├── staff.repository.ts      # Staff collection
├── attendance.repository.ts # Attendance collection
├── fees.repository.ts       # Fees collection
├── class.repository.ts      # Classes collection
├── homework.repository.ts   # Homework collection
├── parents.repository.ts    # Parents collection
├── bus.repository.ts        # Buses collection
├── video-lecture.repository.ts # Video lectures collection
├── tenant-branding.repository.ts # Tenant branding
└── index.ts                 # Barrel export
```

**BaseRepository<T> provides:**
- `create(data, tenantId)` → string
- `update(id, data, tenantId)` → void (with tenant verification)
- `delete(id, tenantId)` → void (with tenant verification)
- `findById(id, tenantId)` → T | null (with tenant verification)
- `findAll(tenantId)` → T[]
- `paginate(tenantId, page, limit)` → { data, total, page, totalPages }
- `count(tenantId)` → number
- `exists(id, tenantId)` → boolean
- `softDelete(id, tenantId)` → void
- `bulkCreate(dataArray, tenantId)` → string[]

---

## 25. AI Architecture

```
lib/ai/
├── gateway/
│   └── AIGateway.ts         # Strategy pattern gateway
├── providers/
│   ├── AIProvider.ts         # Interface definition
│   └── GeminiProvider.ts    # Google Gemini implementation
├── strategies/
│   ├── IAgentStrategy.ts    # Strategy interface
│   └── FinanceAgent.ts      # Finance analysis agent
├── agents/
│   └── AgentRegistry.ts     # Agent registration & dispatch
├── monitoring/
│   └── UsageTracker.ts      # Token/cost tracking
└── config.ts                # AI configuration
```

**Flow:** Route → Hook → AIGateway → Provider → Agent → Response

---

## 26. OCR Architecture

```
lib/mappers/
├── shared.ts                # Shared utilities (toDateInputFormat, toNumber, etc.)
├── staff.mapper.ts          # Staff OCR → Form mapping
└── student.mapper.ts        # Student OCR → Form mapping

services/
└── OCRService.ts            # OCR orchestration
```

**OCR Pipeline:**
1. Upload file → Sharp preprocessing
2. GeminiProvider → Extract structured JSON
3. Mapper → Map to form fields with confidence scores
4. Confidence Engine → Classify (High/Medium/Low)
5. Review Queue → Low confidence items flagged for review

---

## 27. Validation Architecture

```
lib/validation/
├── schemas/                 # Zod schemas per domain
│   ├── student.schema.ts
│   ├── staff.schema.ts
│   ├── fees.schema.ts
│   └── ...
├── ValidationService.ts    # Centralized validation runner
└── index.ts
```

**Route-level validation:**
```typescript
withValidation(schema)(handler)
```

---

## 28. Deployment Architecture

```
GitHub Push → GitHub Actions CI
  ├── Lint (ESLint)
  ├── Type Check (tsc --noEmit)
  ├── Tests (Jest - 198 tests)
  ├── Build (Next.js)
  ├── Security Audit (npm audit)
  └── CodeQL Analysis
       │
       ▼
Vercel Deployment (auto-deploy on main)
  ├── Serverless Functions (API routes)
  ├── Static Pages (87 pages)
  └── Edge Middleware (auth gate)
       │
       ▼
Firebase (Firestore + Auth + Storage)
  ├── Daily Backups (GitHub Actions → GCS)
  └── Security Rules (enforced)
```

---

## 29. Monitoring Architecture

**Implemented:**
- Structured Logger with levels: info, error, warn, debug, audit, security, ocr, ai, performance, api, repository, validation
- Request logging via `logger.logRequest(req, duration, status)`
- Audit trail via `AuditService` writing to Firestore `logs` collection
- Health check endpoint (`/api/health`)
- Telemetry service (`services/telemetry.service.ts`)
- Usage tracking for AI (`UsageTracker`)

**Ready to Enable:**
- Sentry (configured, commented out in `next.config.js`)
- `sentry.edge.config.ts` and `sentry.server.config.ts` exist

---

## 30. Conclusion

EduPilot has been hardened for production deployment with significant improvements in security, reliability, and maintainability. The architecture is sound and follows enterprise patterns throughout.

**Ready for:**
- Production deployment to Vercel + Firebase
- Commercial pilot with limited schools
- Investor demos

**Not yet ready for:**
- Large-scale enterprise deployment (needs Redis caching, circuit breakers)
- Government compliance (needs formal security audit, WCAG certification)
- International markets (needs multi-currency, tax calculation)

**Immediate next steps:**
1. Migrate `xlsx` to `exceljs` to eliminate high-severity vulnerabilities
2. Enable Sentry for production error monitoring
3. Add integration tests with Firebase emulator
4. Implement Redis caching for dashboard stats
5. Add CSP header after inline script audit
