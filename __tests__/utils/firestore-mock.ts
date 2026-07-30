// __tests__/utils/firestore-mock.ts
import { jest } from "@jest/globals";

export type MockDocData = Record<string, unknown>;

const pathCache = new Map<string, MockDocRef | MockCollectionRef>();

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
  offset: jest.Mock;
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
  offset: jest.Mock;
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

function createMockDocGet(data: MockDocData | undefined, exists: boolean, id: string): jest.Mock {
  return jest.fn<() => { id: string; data: () => MockDocData | undefined; exists: boolean }>()
    .mockReturnValue({ id, data: () => data, exists });
}

function createMockCountGet(count: number): jest.Mock {
  return jest.fn<() => { data: () => { count: number } }>()
    .mockReturnValue({ data: () => ({ count }) });
}

function createMockQueryGet(
  docs: readonly { id: string; data: () => MockDocData | undefined; ref: { id: string } }[]
): jest.Mock {
  return jest.fn<() => { docs: readonly { id: string; data: () => MockDocData | undefined; ref: { id: string } }[]; size: number; empty: boolean }>()
    .mockReturnValue({ docs, size: docs.length, empty: docs.length === 0 });
}

function createMockDocRef(id: string, data: MockDocData | undefined, exists: boolean = true, fullPath: string = ""): MockDocRef {
  const docRef: MockDocRef = {
    id,
    data: jest.fn<() => MockDocData | undefined>().mockReturnValue(data),
    exists,
    get: createMockDocGet(data, exists, id),
    set: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    ref: { id },
    collection: jest.fn<(subCollectionName: string) => MockCollectionRef>((subCollectionName: string) => {
      const subPath = fullPath + "/" + subCollectionName;
      if (pathCache.has(subPath)) {
        return pathCache.get(subPath) as MockCollectionRef;
      }
      const subCollection = createMockCollection([], subCollectionName);
      pathCache.set(subPath, subCollection);
      return subCollection;
    }),
  };
  return docRef;
}

function createMockCollection(docs: MockDocRef[] = [], collectionName: string = "test"): MockCollectionRef {
  const docsSnap = docs.map(d => ({ id: d.id, data: () => d.data(), ref: d.ref })) as readonly { id: string; data: () => MockDocData | undefined; ref: { id: string } }[];
  const mockQuery: MockQuery = {
    where: jest.fn<() => MockQuery>().mockReturnThis(),
    orderBy: jest.fn<() => MockQuery>().mockReturnThis(),
    limit: jest.fn<() => MockQuery>().mockReturnThis(),
    startAfter: jest.fn<() => MockQuery>().mockReturnThis(),
    offset: jest.fn<() => MockQuery>().mockReturnThis(),
    count: jest.fn<() => { get: jest.Mock }>().mockReturnValue({ get: createMockCountGet(docs.length) }),
    select: jest.fn<() => MockQuery>().mockReturnThis(),
    get: createMockQueryGet(docsSnap),
  };

  const createBatch = () => ({
    set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  });

  const createTransaction = () => ({
    get: jest.fn<() => Promise<{ exists: boolean; data: () => MockDocData }>>().mockResolvedValue({ exists: true, data: () => ({}) }),
    set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    create: jest.fn<(data: unknown, options?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'new-id' }),
  });

  return {
    doc: jest.fn<(id?: string) => MockDocRef>((id?: string) => {
      if (!id) id = "mock-doc-id";
      const fullPath = collectionName + "/" + id;
      if (pathCache.has(fullPath)) {
        return pathCache.get(fullPath) as MockDocRef;
      }
      const docRef = createMockDocRef(id, undefined, false, fullPath);
      pathCache.set(fullPath, docRef);
      return docRef;
    }),
    add: jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: "added-id" }),
    get: createMockQueryGet(docsSnap),
    where: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    orderBy: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    limit: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    startAfter: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    offset: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    count: jest.fn<() => { get: jest.Mock }>().mockReturnValue({ get: createMockCountGet(docs.length) }),
    select: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    batch: jest.fn<() => ReturnType<typeof createBatch>>().mockReturnValue(createBatch()),
    runTransaction: jest.fn<(
      fn: (transaction: ReturnType<typeof createTransaction>) => Promise<unknown>
    ) => Promise<unknown>>().mockImplementation((fn: any) => fn(createTransaction())),
  };
}

export function createMockFirestore(collections: Record<string, MockDocRef[]> = {}): MockFirestore {
  const collectionMocks: Record<string, MockCollectionRef> = {};
  
  for (const [name, docs] of Object.entries(collections)) {
    collectionMocks[name] = createMockCollection(docs, name);
  }

  const createBatch = () => ({
    set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  });

  const createTransaction = () => ({
    get: jest.fn<() => Promise<{ exists: boolean; data: () => MockDocData }>>().mockResolvedValue({ exists: true, data: () => ({}) }),
    set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    create: jest.fn<(data: unknown, options?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'new-id' }),
  });

  return {
    collection: jest.fn<(name: string) => MockCollectionRef>((name: string) => {
      if (!collectionMocks[name]) {
        collectionMocks[name] = createMockCollection([], name);
      }
      return collectionMocks[name];
    }),
    batch: jest.fn<() => ReturnType<typeof createBatch>>().mockReturnValue(createBatch()),
    runTransaction: jest.fn<(
      fn: (transaction: ReturnType<typeof createTransaction>) => Promise<unknown>
    ) => Promise<unknown>>().mockImplementation((fn: any) => fn(createTransaction())),
    settings: jest.fn<() => void>(),
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

export interface FirestoreTestFactoryResult {
  adminDb: {
    collection: jest.Mock;
    batch: jest.Mock;
    runTransaction: jest.Mock;
  };
  dbTimestamp: string;
  mockDocRef: {
    get: jest.Mock;
    set: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    id: string;
    collection: jest.Mock;
    ref: { id: string };
  };
  mockQuery: {
    where: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    offset: jest.Mock;
    startAfter: jest.Mock;
    get: jest.Mock;
    count: jest.Mock;
  };
  mockCollection: {
    doc: jest.Mock;
    add: jest.Mock;
    get: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    offset: jest.Mock;
    startAfter: jest.Mock;
    count: jest.Mock;
  };
  mockBatch: {
    delete: jest.Mock;
    set: jest.Mock;
    update: jest.Mock;
    commit: jest.Mock;
  };
}

export function createFirestoreTestFactory(): FirestoreTestFactoryResult {
  const mockCountSnap = { data: () => ({ count: 0 }) };

  const mockDocRef = {
    id: 'mock-doc-id',
    data: jest.fn<() => MockDocData | undefined>().mockReturnValue({}),
    exists: true,
    get: createMockDocGet({}, true, 'mock-doc-id'),
    set: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    collection: jest.fn<(subCollectionName: string) => MockCollectionRef>((subCollectionName: string) => {
      const path = 'mock-doc/' + subCollectionName;
      if (pathCache.has(path)) return pathCache.get(path) as MockCollectionRef;
      const col = createSubCollection(path);
      pathCache.set(path, col);
      return col;
    }),
    ref: { id: 'mock-doc-id' },
  };

  const docsSnap: readonly { id: string; data: () => MockDocData | undefined; ref: { id: string } }[] = [];
  const mockQuery = {
    where: jest.fn<() => MockQuery>().mockReturnThis(),
    orderBy: jest.fn<() => MockQuery>().mockReturnThis(),
    limit: jest.fn<() => MockQuery>().mockReturnThis(),
    offset: jest.fn<() => MockQuery>().mockReturnThis(),
    startAfter: jest.fn<() => MockQuery>().mockReturnThis(),
    get: createMockQueryGet(docsSnap),
    count: jest.fn<() => { get: jest.Mock }>().mockReturnValue({
      get: createMockCountGet(0),
    }),
    select: jest.fn<() => MockQuery>().mockReturnThis(),
  };

  const mockCollection = {
    add: jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: 'added-id' }),
    doc: jest.fn<(id?: string) => MockDocRef>().mockReturnValue(mockDocRef),
    where: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    get: createMockQueryGet(docsSnap),
    orderBy: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    limit: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    offset: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    startAfter: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    count: jest.fn<() => { get: jest.Mock }>().mockReturnValue({
      get: createMockCountGet(0),
    }),
    select: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
    batch: jest.fn<() => ReturnType<typeof createBatch>>().mockReturnValue({
      set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
      update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
      delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
      commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    }),
    runTransaction: jest.fn<(
      fn: (transaction: { get: jest.Mock; set: jest.Mock; update: jest.Mock; delete: jest.Mock; create: jest.Mock }) => Promise<unknown>
    ) => Promise<unknown>>().mockImplementation((fn: any) => fn({
      get: jest.fn<() => Promise<{ exists: boolean; data: () => MockDocData }>>().mockResolvedValue({ exists: true, data: () => ({}) }),
      set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
      update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
      delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
      create: jest.fn<(data: unknown, options?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'new-id' }),
    })),
  };

  const mockBatch = {
    delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };

  return {
    adminDb: {
      collection: jest.fn<(name: string) => MockCollectionRef>().mockReturnValue(mockCollection),
      batch: jest.fn<() => typeof mockBatch>().mockReturnValue(mockBatch),
      runTransaction: jest.fn<(
        fn: (transaction: { get: jest.Mock; set: jest.Mock; update: jest.Mock; delete: jest.Mock; create: jest.Mock }) => Promise<unknown>
      ) => Promise<unknown>>().mockImplementation((fn: any) => fn({
        get: jest.fn<() => Promise<{ exists: boolean; data: () => MockDocData }>>().mockResolvedValue({ exists: true, data: () => ({}) }),
        set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        create: jest.fn<(data: unknown, options?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'new-id' }),
      })),
    },
    dbTimestamp: new Date().toISOString(),
    mockDocRef,
    mockQuery,
    mockCollection,
    mockBatch,
  };

  function createSubCollection(path: string) {
    const docsSnap: readonly { id: string; data: () => MockDocData | undefined; ref: { id: string } }[] = [];
    const mockQuery: MockQuery = {
      where: jest.fn<() => MockQuery>().mockReturnThis(),
      orderBy: jest.fn<() => MockQuery>().mockReturnThis(),
      limit: jest.fn<() => MockQuery>().mockReturnThis(),
      offset: jest.fn<() => MockQuery>().mockReturnThis(),
      startAfter: jest.fn<() => MockQuery>().mockReturnThis(),
      count: jest.fn<() => { get: jest.Mock }>().mockReturnValue({ get: createMockCountGet(0) }),
      select: jest.fn<() => MockQuery>().mockReturnThis(),
      get: createMockQueryGet(docsSnap),
    };

    const collection: MockCollectionRef = {
      add: jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: 'added-id' }),
      doc: jest.fn<(id?: string) => MockDocRef>((docId?: string) => {
        const id = docId || 'mock-doc-id';
        const docPath = path + '/' + id;
        if (pathCache.has(docPath)) return pathCache.get(docPath) as MockDocRef;
        const doc = createMockDocRef(id, undefined, false, docPath);
        pathCache.set(docPath, doc);
        return doc;
      }),
      where: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
      orderBy: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
      limit: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
      offset: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
      startAfter: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
      get: createMockQueryGet(docsSnap),
      count: jest.fn<() => { get: jest.Mock }>().mockReturnValue({ get: createMockCountGet(0) }),
      select: jest.fn<() => MockQuery>().mockReturnValue(mockQuery),
      batch: jest.fn<() => ReturnType<typeof createBatch>>().mockReturnValue({
        set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      }),
      runTransaction: jest.fn<(
        fn: (transaction: { get: jest.Mock; set: jest.Mock; update: jest.Mock; delete: jest.Mock; create: jest.Mock }) => Promise<unknown>
      ) => Promise<unknown>>().mockImplementation((fn: any) => fn({
        get: jest.fn<() => Promise<{ exists: boolean; data: () => MockDocData }>>().mockResolvedValue({ exists: true, data: () => ({}) }),
        set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
        create: jest.fn<(data: unknown, options?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'new-id' }),
      })),
    };

    pathCache.set(path, collection);
    return collection;
  }
}

function createBatch() {
  return {
    set: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    update: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    delete: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    commit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}
