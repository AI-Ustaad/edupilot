# EduPilot Test Infrastructure

## Overview

This directory contains shared test utilities and infrastructure for EduPilot's test suite. The setup is designed to provide centralized mocking for `@/lib/firebase-admin`, `@/lib/logger/logger`, and common test data factories.

## Files

### `setup.ts`

The shared test setup file loaded by Jest via `setupFilesAfterEnv`. It provides:

- Centralized `jest.mock()` calls for `@/lib/firebase-admin` and `@/lib/logger/logger` using modern mock utilities from `__tests__/utils/`
- Exported helper functions for use in test files

### `utils/`

Shared mock utilities (do not modify directly):

| File | Purpose |
|------|---------|
| `firestore-mock.ts` | Modern Firestore mocks: `createMockAdminDb`, `createMockFirestore`, `createMockDoc`, `createMockSnapshot`, and type definitions (`MockFirestore`, `MockDocRef`, `MockCollectionRef`, `MockQuery`) |
| `logger-mock.ts` | Logger mock: `setupLoggerMock()`, `clearLoggerMocks()`, `mockLogger` |
| `repository-factory.ts` | Repository test context factory: `createRepositoryTestContext()` |
| `index.ts` | Barrel file re-exporting all utilities |

## Usage in Test Files

### 1. Import helper functions

```typescript
import { setupFirestoreMock, createMockTenant, createMockUser, clearLoggerMocks } from '../setup';
```

### 2. Set up Firestore mocks with specific collections

```typescript
beforeEach(() => {
  jest.clearAllMocks();

  const mockDb = setupFirestoreMock({
    tenants: [
      { id: 'tenant-1', data: { name: 'Acme Corp', status: 'active' } },
      { id: 'tenant-2', data: { name: 'Globex Inc', status: 'inactive' } },
    ],
    users: [],
  });

  const mockCollection = mockDb.collection('tenants') as MockCollectionRef;
});
```

### 3. Create mock data objects

```typescript
const tenant = createMockTenant({ id: 'custom-id', name: 'My Tenant' });
const user = createMockUser({ uid: 'user-123', email: 'user@example.com', role: 'teacher' });
```

### 4. Set up logger mocks

```typescript
beforeEach(() => {
  setupLoggerMock();
});

afterEach(() => {
  clearLoggerMocks();
});
```

### 5. Use repository test context

```typescript
import { createRepositoryTestContext } from '../setup';

const { repository, mockDb, mockCollection, mockDoc, tenantId } =
  createRepositoryTestContext(MyRepository, 'my-collection', [
    { id: 'doc-1', data: { field: 'value' } },
  ]);
```

## Key Concepts

### `jest.mock()` at the top level

All `jest.mock()` calls in `setup.ts` are at the top level of the module, as required by Jest's module mocking system. This ensures mocks are registered before any test code runs. Test files should NOT add their own `jest.mock('@/lib/firebase-admin', ...)` calls — the centralized mock in `setup.ts` handles this.

### Mock reconfiguration in `beforeEach`

The default mock created by `setup.ts` provides basic Firestore mocking. To customize mock behavior per test, use `setupFirestoreMock(collections)` in `beforeEach` to create a new mock Firestore with specific document data, then manually reconfigure the `adminDb.collection` mock:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  const mockDb = setupFirestoreMock({
    tenants: [
      { id: 'tenant-1', data: { name: 'Acme', status: 'active' } },
    ],
  });

  // Re-wire the collection mock to return our custom data
  const { adminDb } = require('@/lib/firebase-admin');
  adminDb.collection = jest.fn((name: string) => mockDb.collection(name));
});
```

### Module path mapping

The `moduleNameMapper` in `jest.config.ts` maps `@/*` to the project root:

```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
},
```