// repositories/base.repository.ts
import { adminDb, dbTimestamp } from '@/lib/firebase-admin';
import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';

// 🟢 Enterprise Helper: فائر بیس کے ٹائم سٹیمپس کو محفوظ ISO Strings میں بدلنے کے لیے
export function serializeDoc<T>(doc: DocumentSnapshot | any): T & { id: string } {
  const data = doc.data() || {};
  
  for (const key in data) {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate().toISOString();
    } else if (data[key] && data[key]._seconds !== undefined) {
      data[key] = new Date(data[key]._seconds * 1000).toISOString();
    }
  }
  
  return { id: doc.id, ...data } as T & { id: string };
}

export class BaseRepository<T> {
  protected collectionName: string;
  protected db: Firestore;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.db = adminDb;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<string> {
    const newData = {
      ...data,
      createdAt: dbTimestamp,
      updatedAt: dbTimestamp,
      tenantId
    };
    const docRef = await this.db.collection(this.collectionName).add(newData);
    return docRef.id;
  }

  async update(id: string, data: Partial<T>, tenantId: string): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: dbTimestamp
    };
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error('Document not found or unauthorized');
    }
    await docRef.update(updateData);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error('Document not found or unauthorized');
    }
    await docRef.delete();
  }

  async findById(id: string, tenantId: string): Promise<(T & { id: string }) | null> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      return null;
    }
    // 🟢 Applied Serializer Here
    return serializeDoc<T>(docSnap);
  }

  async findAll(tenantId: string): Promise<(T & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('tenantId', '==', tenantId)
      .get();
    // 🟢 Applied Serializer Here
    return snapshot.docs.map(doc => serializeDoc<T>(doc));
  }

  async paginate(
    tenantId: string,
    page: number,
    limit: number,
    orderBy?: string,
    direction?: 'asc' | 'desc'
  ): Promise<{ data: (T & { id: string })[]; total: number; page: number; totalPages: number }> {
    const col = this.db.collection(this.collectionName);
    let query: FirebaseFirestore.Query = col.where('tenantId', '==', tenantId);

    const countSnap = await query.count().get();
    const total = countSnap.data().count;
    const totalPages = Math.ceil(total / limit) || 1;

    if (orderBy) {
      query = query.orderBy(orderBy, direction || 'asc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    const offset = (page - 1) * limit;
    if (offset > 0) {
      const startAfterSnap = await query.limit(offset).get();
      const lastDoc = startAfterSnap.docs[startAfterSnap.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.limit(limit).get();
    // 🟢 Applied Serializer Here
    const data = snapshot.docs.map(doc => serializeDoc<T>(doc));

    return { data, total, page, totalPages };
  }

  async count(tenantId: string): Promise<number> {
    const snap = await this.db
      .collection(this.collectionName)
      .where('tenantId', '==', tenantId)
      .count()
      .get();
    return snap.data().count;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    return doc.exists && doc.data()?.tenantId === tenantId;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error('Document not found or unauthorized');
    }
    await docRef.update({
      deletedAt: dbTimestamp,
      updatedAt: dbTimestamp,
    } as any);
  }

  async bulkCreate(
    dataArray: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[],
    tenantId: string
  ): Promise<string[]> {
    const batch = this.db.batch();
    const ids: string[] = [];
    const col = this.db.collection(this.collectionName);

    dataArray.forEach(data => {
      const docRef = col.doc();
      ids.push(docRef.id);
      batch.set(docRef, {
        ...data,
        tenantId,
        createdAt: dbTimestamp,
        updatedAt: dbTimestamp,
      });
    });

    await batch.commit();
    return ids;
  }

  async setWithId(
    id: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    tenantId: string
  ): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    await docRef.set(
      {
        ...data,
        tenantId,
        createdAt: dbTimestamp,
        updatedAt: dbTimestamp,
      },
      { merge: true }
    );
  }

  async bulkSetWithIds(
    entries: Array<{ id: string; data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> }>,
    tenantId: string
  ): Promise<void> {
    const col = this.db.collection(this.collectionName);
    const BATCH_SIZE = 500;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = this.db.batch();
      const chunk = entries.slice(i, i + BATCH_SIZE);
      chunk.forEach(({ id, data }) => {
        const docRef = col.doc(id);
        batch.set(
          docRef,
          {
            ...data,
            tenantId,
            createdAt: dbTimestamp,
            updatedAt: dbTimestamp,
          },
          { merge: true }
        );
      });
      await batch.commit();
    }
  }
}
