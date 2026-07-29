# Test Inventory - EduPilot

## Generated: 2026-07-29

---

## Unit Tests

### Repository Tests (Co-located in `repositories/`)

| File | Tests | Status |
|------|-------|--------|
| `repositories/base.repository.test.ts` | 15 | PASS |
| `repositories/academic-year.repository.test.ts` | - | PASS |
| `repositories/addons.repository.test.ts` | - | PASS |
| `repositories/ai-usage.repository.test.ts` | - | PASS |
| `repositories/assignment.repository.test.ts` | - | PASS |
| `repositories/attendance.repository.test.ts` | - | PASS |
| `repositories/audit.repository.test.ts` | - | PASS |
| `repositories/behavior.repository.test.ts` | - | PASS |
| `repositories/book.repository.test.ts` | - | PASS |
| `repositories/bus.repository.test.ts` | - | PASS |
| `repositories/chat.repository.test.ts` | - | PASS |
| `repositories/class.repository.test.ts` | - | PASS |
| `repositories/configuration.repository.test.ts` | 11 | FAIL (7) |
| `repositories/curriculum.repository.test.ts` | - | PASS |
| `repositories/dashboard-stats.repository.test.ts` | - | PASS |
| `repositories/event-outbox.repository.test.ts` | - | FAIL |
| `repositories/feature-flag.repository.test.ts` | - | PASS |
| `repositories/fees.repository.test.ts` | - | PASS |
| `repositories/homework.repository.test.ts` | - | PASS |
| `repositories/invoice.repository.test.ts` | - | PASS |
| `repositories/job.repository.test.ts` | 6 | FAIL (6) |
| `repositories/leave.repository.test.ts` | - | PASS |
| `repositories/ledger.repository.test.ts` | - | PASS |
| `repositories/lesson-plan.repository.test.ts` | - | PASS |
| `repositories/marks.repository.test.ts` | - | PASS |
| `repositories/menu.repository.test.ts` | - | PASS |
| `repositories/parents.repository.test.ts` | - | PASS |
| `repositories/quiz.repository.test.ts` | 6 | FAIL (6) |
| `repositories/section.repository.test.ts` | 11 | FAIL (6) |
| `repositories/settings.repository.test.ts` | - | FAIL |
| `repositories/staff.repository.test.ts` | - | PASS |
| `repositories/student.repository.test.ts` | - | PASS |
| `repositories/subscription.repository.test.ts` | - | PASS |
| `repositories/syllabus.repository.test.ts` | - | PASS |
| `repositories/tenant-branding.repository.test.ts` | - | PASS |
| `repositories/tenant.repository.test.ts` | - | PASS |
| `repositories/timetable.repository.test.ts` | - | PASS |
| `repositories/user.repository.test.ts` | - | FAIL |
| `repositories/video-lecture.repository.test.ts` | - | PASS |

### Repository Tests (Separated in `__tests__/repositories/`)

| File | Tests | Status |
|------|-------|--------|
| `__tests__/repositories/subscription.repository.test.ts` | - | PASS |

### Service Tests

| File | Tests | Status |
|------|-------|--------|
| `__tests__/services/configuration-cache.service.test.ts` | - | PASS |
| `__tests__/services/configuration-health.service.test.ts` | - | FAIL (2) |
| `__tests__/services/configuration.service.test.ts` | - | PASS |

### API Route Tests

| File | Tests | Status |
|------|-------|--------|
| `__tests__/api/admin-users.test.ts` | 2 | PASS |
| `__tests__/api/admin-users-role.test.ts` | 3 | PASS |
| `__tests__/api/attendance-report.test.ts` | 5 | PASS |
| `__tests__/api/chat.test.ts` | - | PASS |
| `__tests__/api/curriculum-engine.test.ts` | 2 | PASS |
| `__tests__/api/education-rules.test.ts` | 3 | PASS |
| `__tests__/api/job-status.test.ts` | - | PASS |
| `__tests__/api/ledger.test.ts` | - | PASS |
| `__tests__/api/register-user.test.ts` | - | PASS |
| `__tests__/api/students.test.ts` | 2 | PASS |

### Integration Tests

| File | Tests | Status |
|------|-------|--------|
| `__tests__/integration/enterprise-workflows.test.ts` | 7 | PASS |

### Utility/Helper Tests

| File | Tests | Status |
|------|-------|--------|
| `__tests__/lib/auth-server.test.ts` | 3 | PASS |
| `__tests__/lib/events/event-bus.test.ts` | - | PASS |
| `__tests__/lib/events/event-worker.test.ts` | - | PASS |
| `__tests__/lib/mappers/shared.test.ts` | - | PASS |
| `__tests__/lib/mappers/staff.mapper.test.ts` | 19 | PASS |
| `__tests__/lib/mappers/student.mapper.test.ts` | 30 | PASS |
| `__tests__/lib/tenant-resolver.test.ts` | - | PASS |
| `__tests__/validators/all-validators.test.ts` | - | PASS |

### Debug/Diagnostic Tests

| File | Tests | Status |
|------|-------|--------|
| `__tests__/debug.test.ts` | 1 | PASS |

---

## Mock Infrastructure

### Shared Mock Utilities (`__tests__/utils/`)

| File | Purpose | Status |
|------|---------|--------|
| `__tests__/utils/firestore-mock.ts` | Firestore mock factory with `createMockAdminDb`, `createMockFirestore`, `createMockDoc`, `createMockSnapshot`, type definitions (`MockFirestore`, `MockDocRef`, `MockCollectionRef`, `MockQuery`) | EXISTS - needs modernization |
| `__tests__/utils/logger-mock.ts` | Logger mock with `mockLogger`, `setupLoggerMock()`, `clearLoggerMocks()` | EXISTS - needs modernization |
| `__tests__/utils/repository-factory.ts` | Repository test context factory with `createRepositoryTestContext<TRepository>()` | EXISTS - needs modernization |
| `__tests__/utils/index.ts` | Barrel file re-exporting all utilities | EXISTS |

### Mock Files (`__mocks__/`)

| File | Purpose | Status |
|------|---------|--------|
| `__mocks__/next-navigation.ts` | Next.js navigation mock | EXISTS |

### Jest Setup Files

| File | Purpose | Status |
|------|---------|--------|
| `test-setup.ts` | Sets `FIRESTORE_EMULATOR_HOST` and `FIREBASE_PROJECT_ID` env vars | EXISTS |
| `__tests__/setup.ts` | Centralized `jest.mock()` calls for `@/lib/firebase-admin` and `@/lib/logger/logger` | EXISTS - has issues (see below) |

### Jest Configuration

| File | Purpose |
|------|---------|
| `jest.config.ts` | Jest config with `ts-jest` preset, `node` environment, roots for `repositories/`, `services/`, `__tests__/` |

---

## Mock Audit Summary

### Current Mock Types

1. **Admin Firestore Mock** (`adminDb`): Inconsistent across test files; some use `createMockAdminDb` from `firestore-mock.ts`, most use inline `jest.mock()` calls
2. **Admin Auth Mock** (`adminAuth`): Mostly inline, limited to `createUser`, `setCustomUserClaims`, `verifySessionCookie`, `verifyIdToken`
3. **Admin Storage Mock** (`adminStorage`): Essentially empty `{}` in most mocks
4. **Firestore Collection Mock**: Supports `where()`, `orderBy()`, `limit()`, `offset()`, `startAfter()`, `count()`, `get()`, `add()`, `doc()` - but NOT `subcollection access via doc().collection()`
5. **Firestore Document Mock**: Supports `get()`, `set()`, `update()`, `delete()` - but `get()` often returns `undefined` instead of a proper snapshot
6. **Firestore Query Mock**: Supports chaining of `where()`, `orderBy()`, `limit()`, etc. but `count()` return type is inconsistent
7. **Transaction Mock**: Limited support in `firestore-mock.ts`; not used in most test files
8. **Batch Mock**: Supports `set()`, `update()`, `delete()`, `commit()` but not always properly chained
9. **Logger Mock**: Supports `info`, `error`, `warn`, `debug`, `child`, `audit`, `security`, `ocr`, `ai`, `performance`, `api`, `repository`, `validation`
10. **Query Builder Mock**: Supports basic chaining but fails on `doc().collection()` sub-collection access

### Key Gaps Identified

1. **Missing sub-collection support**: `doc().collection()` returns `undefined` in most mocks
2. **Missing proper snapshot returned from `doc().get()`**: Many mocks return `undefined` or `null` instead of proper snapshot objects
3. **Missing `FieldValue` mocks**: `serverTimestamp`, `increment`, `arrayUnion`, `arrayRemove` not mocked
4. **Missing `Timestamp` mock**: Firestore `Timestamp` type not properly mocked
5. **Missing `CollectionGroup` mock**: Not supported
6. **Missing `runTransaction` mock**: Not properly implemented in most test files
7. **Missing `doc().create()` mock**: Not supported
8. **Inconsistent `count()` mock**: Some return `{ data: () => ({ count: N }) }`, others don't

---

## Root Cause Analysis of 36 Failing Tests

### Category 1: Setup/Utils Files as Test Suites (5 failures)

**Files**: `__tests__/setup.ts`, `__tests__/utils/firestore-mock.ts`, `__tests__/utils/logger-mock.ts`, `__tests__/utils/repository-factory.ts`, `__tests__/utils/index.ts`

**Root Cause**: Jest's default `testMatch` pattern includes `**/__tests__/**/*.{ts,tsx,js,jsx}`, which picks up ALL `.ts` files in `__tests__/` including utility modules and setup files that have no test cases.

**Fix**: Add `testMatch` configuration to `jest.config.ts` to only pick up `*.test.ts` and `*.spec.ts` files, or add `testPathIgnorePatterns` to exclude non-test files.

### Category 2: Mock Firestore Missing Sub-Collection Support (15+ failures)

**Files**: `repositories/configuration.repository.test.ts`, `repositories/job.repository.test.ts`, `repositories/quiz.repository.test.ts`, `repositories/section.repository.test.ts`, `repositories/settings.repository.test.ts`, `repositories/user.repository.test.ts`, `repositories/event-outbox.repository.test.ts`

**Root Cause**: The mock Firestore implementation doesn't properly support `doc().collection()` chaining. When `BaseRepository` or a custom repository method calls `adminDb.collection("tenants").doc(tenantId).collection("settings")`, the mock's `doc()` returns an object without a `collection()` method, causing `"Cannot read properties of undefined (reading 'exists')"` or `".collection is not a function"` errors.

**Fix**: Modernize `firestore-mock.ts` to support sub-collection access via `doc().collection()`, and ensure `doc().get()` returns a proper snapshot object with `exists`, `data()`, and `id`.

### Category 3: Mock Firestore doc().get() Returns Undefined (8+ failures)

**Files**: Various repository tests

**Root Cause**: The mock `doc()` function returns an object with `get` mock, but the mock doesn't properly return a resolved value with a snapshot-like object (with `exists`, `data()`, `id`). When tests call `mockDocRef.get`, it returns `undefined` or an unresolved promise.

**Fix**: Ensure `doc().get()` returns a proper snapshot object with `exists`, `data()`, and `id` properties.

### Category 4: ConfigurationHealthService Test Dependencies (2 failures)

**File**: `__tests__/services/configuration-health.service.test.ts`

**Root Cause**: The `ConfigurationHealthService` depends on `ConfigurationRepository` and `TenantRepository`. The mock for `ConfigurationRepository` doesn't properly return data that passes the health checks, causing `expect(received).toBe(expected)` failures.

**Fix**: Update the mock setup for `ConfigurationRepository` to return proper configuration data, and ensure `TenantRepository` mock returns `true` for `verifyTenantExists`.

---

## Test Statistics

- Total Tests: 692
- Passing: 656
- Failing: 36
- Pass Rate: 94.8%
- Test Suites: ~50
- Repository Test Files: 39 (co-located + separated)
- API Test Files: 11
- Service Test Files: 3
- Integration Test Files: 1
- Utility/Mock Files: 5
- Other Test Files: 8

---

## Architecture Alignment

### Current Architecture Pattern

```
Route → Validation → DTO → Service → Repository → Firestore
```

### Repository Pattern

- All repositories extend `BaseRepository<T>` or implement repository interfaces
- `BaseRepository` provides: `create`, `update`, `delete`, `findById`, `findAll`, `paginate`, `count`, `exists`, `softDelete`, `bulkCreate`
- Some repositories override methods for domain-specific queries
- Tenant isolation is enforced via `tenantId` parameter on all operations
- Authorization is checked by verifying `tenantId` match on doc access
- Soft deletes use `deletedAt` timestamp
- Timestamps use `dbTimestamp` from `@/lib/firebase-admin`

### Service Layer Pattern

- Services use dependency injection or direct instantiation
- Services orchestrate between repositories and domain logic
- Services handle error propagation and logging
- Services use repository interfaces where available

### Key Interfaces

- `IConfigurationRepository` - Configuration CRUD with sub-collections
- `IQuizRepository` - Quiz and submission management
- `IUserRepository` - User CRUD with email fallback
- `ISectionRepository` - Section management with soft deletes
- `IEventOutboxRepository` - Event sourcing outbox pattern
- `ISettingsRepository` - Settings with tenant-scoped sub-collections

---

## Mock Infrastructure Assessment

### Current State

The `__tests__/utils/firestore-mock.ts` provides a `createMockAdminDb()` factory that supports `collection()`, `doc()`, `where()`, `orderBy()`, `limit()`, `count()`, `get()`, `add()`, `batch()`, `runTransaction()`, etc. However:

1. `doc()` does not return an object with a `collection()` method for sub-collection access
2. `doc().get()` returns `undefined` in many inline mocks
3. `doc().collection()` is not implemented in the mock
4. `batch()` doesn't support chained operations properly
5. `transaction()` doesn't support the full Firestore transaction API

### Required Mock Coverage

The mock infrastructure must support:

- `collection()` - Create/access a collection reference
- `doc()` - Create/access a document reference; must return object with `collection()` for sub-collections
- `where()` - Filter query
- `orderBy()` - Sort query
- `limit()` - Limit results
- `offset()` - Pagination offset
- `startAfter()` - Cursor-based pagination
- `select()` - Field selection
- `count()` - Aggregate count
- `get()` - Execute query; must return snapshot with `docs`, `size`, `empty`
- `set()` - Write document (merge or overwrite)
- `add()` - Add new document with auto-ID
- `update()` - Update existing document
- `delete()` - Delete document
- `runTransaction()` - Execute transaction with read/write
- `batch()` - Create write batch
- `commit()` - Commit batch
- `rollback()` - Rollback transaction
- `FieldValue.serverTimestamp()` - Server timestamp
- `FieldValue.increment()` - Numeric increment
- `FieldValue.arrayUnion()` - Array union
- `FieldValue.arrayRemove()` - Array remove
- `Timestamp` - Firestore timestamp type
- `QuerySnapshot` - Snapshot of query results
- `DocumentSnapshot` - Snapshot of single document
