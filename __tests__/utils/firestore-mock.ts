// __tests__/utils/firestore-mock.ts
import { jest } from "@jest/globals";

export type MockDocData = Record<string, any>;

export interface MockDocRef {
  id: string;
  data: () => MockDocData | undefined;
  exists: boolean;
  get: jest.Mock;
  set: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  ref: { id: string };
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
    data: jest.fn().mockReturnValue(data),
    exists,
    get: jest.fn().mockResolvedValue({ id, data: () => data, exists }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    ref: { id },
  };
}

function createMockQuery(docs: MockDocRef[]): MockQuery {
  const mockGet = jest.fn().mockResolvedValue({
    docs: docs.map(d => ({ id: d.id, data: () => d.data(), ref: d.ref })),
    size: docs.length,
    empty: docs.length === 0,
  });

  return {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: docs.length }) }),
    }),
    select: jest.fn().mockReturnThis(),
    get: mockGet,
  };
}

function createMockCollection(docs: MockDocRef[] = [], collectionName: string = "test"): MockCollectionRef {
  const mockQuery = createMockQuery(docs);
  
  return {
    doc: jest.fn((id?: string) => {
      if (id) {
        const doc = docs.find(d => d.id === id) || createMockDocRef(id, undefined, false);
        return doc;
      }
      return createMockDocRef("mock-doc-id", undefined, false);
    }),
    add: jest.fn().mockResolvedValue({ id: "added-id" }),
    get: jest.fn().mockResolvedValue({
      docs: docs.map(d => ({ id: d.id, data: () => d.data(), ref: d.ref })),
      size: docs.length,
      empty: docs.length === 0,
    }),
    where: jest.fn().mockReturnValue(mockQuery),
    orderBy: jest.fn().mockReturnValue(mockQuery),
    limit: jest.fn().mockReturnValue(mockQuery),
    startAfter: jest.fn().mockReturnValue(mockQuery),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: docs.length }) }),
    }),
    select: jest.fn().mockReturnValue(mockQuery),
    batch: jest.fn().mockReturnValue({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    }),
    runTransaction: jest.fn((fn) => fn({
      get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
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
    collection: jest.fn((name: string) => {
      if (!collectionMocks[name]) {
        collectionMocks[name] = createMockCollection([], name);
      }
      return collectionMocks[name];
    }),
    batch: jest.fn().mockReturnValue({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    }),
    runTransaction: jest.fn((fn) => fn({
      get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
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
