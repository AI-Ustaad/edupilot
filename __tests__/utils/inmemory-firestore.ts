import type { Firestore } from "firebase-admin/firestore";

export type DocData = Record<string, any>;

interface DocSnapshot {
  id: string;
  data: () => DocData | undefined;
  exists: boolean;
  ref: { id: string };
}

class InMemoryDocRef {
  readonly id: string;
  readonly _collection: InMemoryCollection;

  constructor(id: string, collection: InMemoryCollection) {
    this.id = id;
    this._collection = collection;
  }

  async get(): Promise<DocSnapshot> {
    const data = this._collection.store.get(this.id);
    const exists = data !== undefined;
    return {
      id: this.id,
      data: () => (data ? { ...data } : undefined),
      exists,
      ref: { id: this.id },
    };
  }

  async set(data: DocData, options?: { merge?: boolean }): Promise<void> {
    if (options?.merge) {
      const existing = this._collection.store.get(this.id) || {};
      this._collection.store.set(this.id, { ...existing, ...data });
    } else {
      this._collection.store.set(this.id, { ...data });
    }
  }

  async update(data: DocData): Promise<void> {
    const existing = this._collection.store.get(this.id) || {};
    this._collection.store.set(this.id, { ...existing, ...data });
  }

  async delete(): Promise<void> {
    this._collection.store.delete(this.id);
  }

  get ref() {
    return { id: this.id, update: (d: DocData) => this.update(d), delete: () => this.delete() } as any;
  }

  collection(name: string): InMemoryCollection {
    const key = `${this._collection.name}/${this.id}/${name}`;
    return this._collection._db.stores.has(key)
      ? new InMemoryCollectionSub(key, this._collection._db)
      : new InMemoryCollectionSub(key, this._collection._db);
  }
}

class InMemoryCollectionSub {
  readonly name: string;
  readonly store: DocStore;
  readonly _db: InMemoryFirestore;
  readonly _path: string;

  constructor(path: string, db: InMemoryFirestore) {
    this._path = path;
    this.name = path.split("/").pop() || path;
    this.store = db.stores.get(path) || new DocStore();
    this._db = db;
    db.stores.set(path, this.store);
  }

  doc(id?: string): InMemoryDocRef {
    const docId = id || `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new InMemoryDocRef(docId, this as any);
  }

  async add(data: DocData): Promise<{ id: string }> {
    const id = `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.store.set(id, { ...data });
    return { id };
  }

  get = ((query?: InMemoryQuery) => {
    const q = query || new InMemoryQuery(this, [], [], null);
    return q.get();
  }) as any;

  where(field: string, op: string, value: any): InMemoryQuery {
    return new InMemoryQuery(this, [[field, op, value]], [], null);
  }

  orderBy(field: string, dir: "asc" | "desc" = "asc"): InMemoryQuery {
    return new InMemoryQuery(this, [], [[field, dir]], null);
  }

  limit(n: number): InMemoryQuery {
    return new InMemoryQuery(this, [], [], n);
  }

  startAfter(_doc: any): InMemoryQuery {
    return new InMemoryQuery(this, [], [], null);
  }

  offset(n: number): InMemoryQuery {
    return new InMemoryQuery(this, [], [], null);
  }

  select(): InMemoryQuery {
    return new InMemoryQuery(this, [], [], null);
  }

  count() {
    return { get: async () => ({ data: () => ({ count: this.store.size() }) }) };
  }

  batch(): InMemoryBatch {
    return new InMemoryBatch();
  }

  runTransaction(fn: (t: any) => Promise<any>): Promise<any> {
    return fn(new InMemoryBatch());
  }
}

const opMatches = (actual: any, op: string, expected: any): boolean => {
  switch (op) {
    case "==":
      return actual === expected;
    case "!=":
      return actual !== expected;
    case "array-contains":
      return Array.isArray(actual) && actual.includes(expected);
    default:
      return actual === expected;
  }
};

class InMemoryQuery {
  readonly _collection: InMemoryCollection;
  readonly _filters: Array<[string, string, any]> = [];
  readonly _orderBy: Array<[string, "asc" | "desc"]> = [];
  readonly _limit: number | null = null;

  constructor(collection: InMemoryCollection, filters: Array<[string, string, any]> = [], orderBy: Array<[string, "asc" | "desc"]> = [], limit: number | null = null) {
    this._collection = collection;
    this._filters = filters;
    this._orderBy = orderBy;
    this._limit = limit;
  }

  where(field: string, op: string, value: any): InMemoryQuery {
    return new InMemoryQuery(this._collection, [...this._filters, [field, op, value]], this._orderBy, this._limit);
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc"): InMemoryQuery {
    return new InMemoryQuery(this._collection, this._filters, [...this._orderBy, [field, direction]], this._limit);
  }

  limit(n: number): InMemoryQuery {
    return new InMemoryQuery(this._collection, this._filters, this._orderBy, n);
  }

  offset(n: number): InMemoryQuery {
    return new InMemoryQuery(this._collection, this._filters, this._orderBy, this._limit);
  }

  startAfter(_doc: any): InMemoryQuery {
    return this;
  }

  select(): InMemoryQuery {
    return this;
  }

  async get(): Promise<{ docs: DocSnapshot[]; size: number; empty: boolean }> {
    let docs = Array.from(this._collection.store.entries()).map(([id, data]) => ({ id, data: { ...data } }));
    docs = docs.filter(({ data }) => this._filters.every(([f, op, v]) => opMatches(data[f], op, v)));
    for (const [field, dir] of this._orderBy) {
      docs.sort((a, b) => {
        const av = a.data[field];
        const bv = b.data[field];
        if (av === bv) return 0;
        if (av === undefined) return dir === "asc" ? -1 : 1;
        if (bv === undefined) return dir === "asc" ? 1 : -1;
        return av < bv ? (dir === "asc" ? -1 : 1) : dir === "asc" ? 1 : -1;
      });
    }
    if (this._limit) docs = docs.slice(0, this._limit);
    return {
      docs: docs.map(d => ({
        id: d.id,
        data: () => ({ ...d.data }),
        exists: true,
        ref: { id: d.id },
      })),
      size: docs.length,
      empty: docs.length === 0,
    };
  }

  count() {
    return { get: async () => ({ data: () => ({ count: 0 }) }) };
  }
}

class InMemoryBatch {
  readonly _ops: Array<() => Promise<void>> = [];
  set(docRef: any, data: DocData, _options?: any): void {
    this._ops.push(() => docRef.set(data, { merge: true }));
  }
  update(docRef: any, data: DocData): void {
    this._ops.push(() => docRef.update(data));
  }
  delete(docRef: any): void {
    this._ops.push(() => docRef.delete());
  }
  async commit(): Promise<void> {
    for (const op of this._ops) await op();
    this._ops.length = 0;
  }
}

class InMemoryCollection {
  readonly name: string;
  readonly store: DocStore;
  readonly _db: InMemoryFirestore;

  constructor(name: string, db: InMemoryFirestore) {
    this.name = name;
    this.store = db.stores.get(name) || new DocStore();
    this._db = db;
    db.stores.set(name, this.store);
  }

  doc(id?: string): InMemoryDocRef {
    const docId = id || `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new InMemoryDocRef(docId, this);
  }

  async add(data: DocData): Promise<{ id: string }> {
    const id = `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.store.set(id, { ...data });
    return { id };
  }

  get = ((query?: InMemoryQuery) => {
    const q = query || new InMemoryQuery(this, [], [], null);
    return q.get();
  }) as any;

  where(field: string, op: string, value: any): InMemoryQuery {
    return new InMemoryQuery(this, [[field, op, value]], [], null);
  }

  orderBy(field: string, dir: "asc" | "desc" = "asc"): InMemoryQuery {
    return new InMemoryQuery(this, [], [[field, dir]], null);
  }

  limit(n: number): InMemoryQuery {
    return new InMemoryQuery(this, [], [], n);
  }

  startAfter(_doc: any): InMemoryQuery {
    return new InMemoryQuery(this, [], [], null);
  }

  offset(n: number): InMemoryQuery {
    return new InMemoryQuery(this, [], [], null);
  }

  select(): InMemoryQuery {
    return new InMemoryQuery(this, [], [], null);
  }

  count() {
    return { get: async () => ({ data: () => ({ count: this.store.size() }) }) };
  }

  batch(): InMemoryBatch {
    return new InMemoryBatch();
  }

  runTransaction(fn: (t: any) => Promise<any>): Promise<any> {
    return fn(new InMemoryBatch());
  }
}

class DocStore {
  private docs: Map<string, DocData> = new Map();
  get(id: string): DocData | undefined {
    return this.docs.get(id);
  }
  set(id: string, data: DocData): void {
    this.docs.set(id, data);
  }
  delete(id: string): void {
    this.docs.delete(id);
  }
  entries() {
    return Array.from(this.docs.entries());
  }
  size(): number {
    return this.docs.size;
  }
}

export class InMemoryFirestore {
  readonly stores: Map<string, DocStore> = new Map();

  collection(name: string): InMemoryCollection {
    return new InMemoryCollection(name, this);
  }

  batch(): InMemoryBatch {
    return new InMemoryBatch();
  }

  runTransaction(fn: (t: any) => Promise<any>): Promise<any> {
    return fn(new InMemoryBatch());
  }

  settings(): void {}

  clear(): void {
    this.stores.clear();
  }
}

export function createInMemoryFirestore(): InMemoryFirestore {
  return new InMemoryFirestore();
}

export function asAdminDb(db: InMemoryFirestore): Firestore {
  return db as unknown as Firestore;
}
