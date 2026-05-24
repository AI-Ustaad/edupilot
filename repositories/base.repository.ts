// repositories/base.repository.ts
import { adminDb } from "@/lib/firebase-admin";
import { dbTimestamp } from "@/lib/firebase-admin";

export abstract class BaseRepository<T> {
  protected abstract collectionName: string;

  // ✅ نئے ڈھانچے کے مطابق collection reference
  protected getCollection(tenantId: string) {
    return adminDb.collection(`tenants/${tenantId}/${this.collectionName}`);
  }

  async findById(id: string, tenantId: string): Promise<T | null> {
    const doc = await this.getCollection(tenantId).doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as T) : null;
  }

  async findAll(tenantId: string, limit = 50, offset = 0): Promise<T[]> {
    const snapshot = await this.getCollection(tenantId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async create(data: Partial<T>, tenantId: string): Promise<T> {
    const ref = this.getCollection(tenantId).doc();
    const newData = { 
      ...data, 
      createdAt: dbTimestamp.now(),
      updatedAt: dbTimestamp.now(),
      tenantId 
    };
    await ref.set(newData);
    return { id: ref.id, ...newData } as T;
  }

  async update(id: string, data: Partial<T>, tenantId: string): Promise<void> {
    await this.getCollection(tenantId).doc(id).update({ 
      ...data, 
      updatedAt: dbTimestamp.now() 
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.getCollection(tenantId).doc(id).delete();
  }

  async paginate(tenantId: string, page = 1, limit = 20): Promise<{ items: T[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const snapshot = await this.getCollection(tenantId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    const totalSnapshot = await this.getCollection(tenantId).count().get();
    const total = totalSnapshot.data().count;
    
    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
