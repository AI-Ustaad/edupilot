// __tests__/setup.ts
import {
  createMockAdminDb,
  createMockFirestore,
  createMockDoc,
  createMockSnapshot,
  type MockFirestore,
  type MockDocRef,
} from './utils/firestore-mock';
import {
  mockLogger,
  setupLoggerMock,
  clearLoggerMocks,
} from './utils/logger-mock';
import {
  createRepositoryTestContext,
  type RepositoryTestContext,
} from './utils/repository-factory';

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: createMockAdminDb(),
  adminAuth: {},
  adminStorage: {},
  dbTimestamp: new Date().toISOString(),
}));

jest.mock('@/lib/logger/logger', () => ({
  logger: mockLogger,
  createLogger: jest.fn().mockReturnValue(mockLogger),
}));

export type { MockFirestore, MockDocRef } from './utils/firestore-mock';
export type { RepositoryTestContext } from './utils/repository-factory';

export {
  createMockAdminDb,
  createMockFirestore,
  createMockDoc,
  createMockSnapshot,
  setupLoggerMock,
  clearLoggerMocks,
  mockLogger,
  createRepositoryTestContext,
  setupFirestoreMock,
  createMockTenant,
  createMockUser,
};

function setupFirestoreMock(collections: Record<string, MockDocRef[]> = {}): MockFirestore {
  return createMockAdminDb(collections);
}

function createMockTenant(overrides?: Record<string, any>) {
  return {
    id: 'test-tenant',
    name: 'Test Tenant',
    slug: 'test-tenant',
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockUser(overrides?: Record<string, any>) {
  return {
    uid: 'test-user-uid',
    email: 'test@example.com',
    role: 'admin',
    tenantId: 'test-tenant',
    displayName: 'Test User',
    ...overrides,
  };
}