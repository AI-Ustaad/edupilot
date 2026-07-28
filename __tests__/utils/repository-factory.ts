// __tests__/utils/repository-factory.ts
import { createMockAdminDb, createMockDoc, createMockSnapshot, type MockDocRef, type MockCollectionRef } from "./firestore-mock";

export interface RepositoryTestContext<TRepository> {
  repository: TRepository;
  mockDb: ReturnType<typeof createMockAdminDb>;
  mockCollection: MockCollectionRef;
  mockDoc: MockDocRef;
  tenantId: string;
}

export function createRepositoryTestContext<TRepository>(
  RepositoryClass: new (...args: any[]) => TRepository,
  collectionName: string,
  initialDocs: MockDocRef[] = []
): RepositoryTestContext<TRepository> {
  const mockDb = createMockAdminDb({
    [collectionName]: initialDocs,
  });
  
  const mockCollection = mockDb.collection(collectionName) as unknown as MockCollectionRef;
  const mockDoc = initialDocs[0] || createMockDoc({}, true);

  // Mock the firebase-admin module
  jest.mock("@/lib/firebase-admin", () => ({
    adminDb: mockDb,
    adminAuth: {},
    adminStorage: {},
    dbTimestamp: new Date().toISOString(),
  }));

  const repository = new RepositoryClass();

  return {
    repository,
    mockDb,
    mockCollection,
    mockDoc,
    tenantId: "test-tenant",
  };
}
