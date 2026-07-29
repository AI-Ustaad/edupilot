import { createMockAdminDb, createMockDoc, createMockSnapshot, type MockDocRef, type MockCollectionRef, type MockAdminDb } from "./firestore-mock";

export interface RepositoryTestContext<TRepository> {
  repository: TRepository;
  mockDb: MockAdminDb;
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

  const repository = new RepositoryClass();

  return {
    repository,
    mockDb,
    mockCollection,
    mockDoc,
    tenantId: "test-tenant",
  };
}
