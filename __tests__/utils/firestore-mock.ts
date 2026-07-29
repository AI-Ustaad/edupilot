// __tests__/utils/firestore-mock.ts
import { jest } from "@jest/globals";

export type MockDocData = Record<string, any>;

const pathCache = new Map<string, any>();

export interface MockDocRef {
  id: string;
  data: jest.Mock;
  exists: boolean;
  get: jest.Mock;
  set: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  ref: { id: string };
  collection: jest.Mock;
}

export interface MockQuery {
  where: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  startAfter: jest.Mock;
  count: jest.Mock;
  select: jest.Mock;
  get: jest.Mock;
}

export interface MockCollectionRef {
  doc: jest.Mock;
  add: jest.Mock;
  get: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  startAfter: jest.Mock;
  count: jest.Mock;
  select: jest.Mock;
  batch: jest.Mock;
  runTransaction: jest.Mock;
}

export interface MockFirestore {
  collection: jest.Mock;
  batch: jest.Mock;
  runTransaction: jest.Mock;
  settings: jest.Mock;
}

export interface MockAdminDb extends MockFirestore {
  collection: jest.Mock;
  batch: jest.Mock;
  runTransaction: jest.Mock;
}

function createMockDocRef(id: string, data: MockDocData | undefined, exists: boolean = true): MockDocRef {
  return {
    id,
    data: jest.fn<any>().mockReturnValue(data),
    exists,
    get: jest.fn<any>().mockResolvedValue({ id, data: () => data, exists }),
    set: jest.fn<any>().mockResolvedValue(undefined),
    update: jest.fn<any>().mockResolvedValue(undefined),
    delete: jest.fn<any>().mockResolvedValue(undefined),
    ref: { id },
    collection: jest.fn(),
  };
}

function createMockQuery(docs: MockDocRef[]): MockQuery {
  const mockGet = jest.fn<any>().mockResolvedValue({
    docs: docs.map(d => ({ id: d.id, data: () => d.data(), ref: d.ref })),
    size: docs.length,
    empty: docs.length === 0,
  });

  return {
    where: jest.fn<any>().mockReturnThis(),
    orderBy: jest.fn<any>().mockReturnThis(),
    limit: jest.fn<any>().mockReturnThis(),
    startAfter: jest.fn<any>().mockReturnThis(),
    count: jest.fn<any>().mockReturnValue({
      get: jest.fn<any>().mockResolvedValue({ data: () => ({ count: docs.length }) }),
    }),
    select: jest.fn<any>().mockReturnThis(),
    get: mockGet,
  };
}

function createMockCollection(docs: MockDocRef[] = [], collectionName: string = "test"): MockCollectionRef {
  const mockQuery = createMockQuery(docs);
  
  return {
    doc: jest.fn<any>((id?: string) => {
      if (!id) id = "mock-doc-id";
      const fullPath = collectionName + "/" + id;
      if (pathCache.has(fullPath)) {
        return pathCache.get(fullPath);
      }
      const docRef = createMockDocRef(id, undefined, false);
      docRef.collection = jest.fn<any>((subCollectionName: string) => {
        const subPath = fullPath + "/" + subCollectionName;
        if (pathCache.has(subPath)) {
          return pathCache.get(subPath);
        }
        const subCollection = createMockCollection([], subCollectionName);
        pathCache.set(subPath, subCollection);
        return subCollection;
      });
      pathCache.set(fullPath, docRef);
      return docRef;
    }),
    add: jest.fn<any>().mockResolvedValue({ id: "added-id" }),
    get: jest.fn<any>().mockResolvedValue({
      docs: docs.map(d => ({ id: d.id, data: () => d.data(), ref: d.ref })),
      size: docs.length,
      empty: docs.length === 0,
    }),
    where: jest.fn<any>().mockReturnValue(mockQuery),
    orderBy: jest.fn<any>().mockReturnValue(mockQuery),
    limit: jest.fn<any>().mockReturnValue(mockQuery),
    startAfter: jest.fn<any>().mockReturnValue(mockQuery),
    count: jest.fn<any>().mockReturnValue({
      get: jest.fn<any>().mockResolvedValue({ data: () => ({ count: docs.length }) }),
    }),
    select: jest.fn<any>().mockReturnValue(mockQuery),
    batch: jest.fn<any>().mockReturnValue({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn<any>().mockResolvedValue(undefined),
    }),
    runTransaction: jest.fn<any>((fn: any) => fn({
      get: jest.fn<any>().mockResolvedValue({ exists: true, data: () => ({}) }),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    })),
  };
}

export function createMockFirestore(collections: Record<string, MockDocRef[]> = {}): MockFirestore {
  const collectionMocks: Record<string, MockCollectionRef> = {};
  
  for (const [name, docs] of Object.entries(collections)) {
    collectionMocks[name] = createMockCollection(docs, name);
  }

  return {
    collection: jest.fn<any>((name: string) => {
      if (!collectionMocks[name]) {
        collectionMocks[name] = createMockCollection([], name);
      }
      return collectionMocks[name];
    }),
    batch: jest.fn<any>().mockReturnValue({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn<any>().mockResolvedValue(undefined),
    }),
    runTransaction: jest.fn<any>((fn: any) => fn({
      get: jest.fn<any>().mockResolvedValue({ exists: true, data: () => ({}) }),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    })),
    settings: jest.fn(),
  };
}

export function createMockAdminDb(collections: Record<string, MockDocRef[]> = {}): MockAdminDb {
  return createMockFirestore(collections) as MockAdminDb;
}

export function createMockDoc(data: MockDocData, exists: boolean = true): MockDocRef {
  return createMockDocRef("mock-doc-id", data, exists);
}

export function createMockSnapshot(docs: MockDocRef[]): { docs: MockDocRef[]; size: number; empty: boolean } {
  return {
    docs,
    size: docs.length,
    empty: docs.length === 0,
  };
}
