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
}
