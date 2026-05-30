import { adminDb, dbTimestamp } from '@/lib/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

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
    return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
  }

  async findAll(tenantId: string): Promise<(T & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('tenantId', '==', tenantId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
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
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));

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
}
