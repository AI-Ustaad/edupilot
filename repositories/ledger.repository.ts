// repositories/ledger.repository.ts
import { adminDb } from "@/lib/firebase-admin";
import { BaseRepository } from "./base.repository";

export interface LedgerEntry {
  id?: string;
  type: string;
  description: string;
  amount: number;
  tenantId: string;
  createdBy: string;
  createdAt?: any;
}

export class LedgerRepository extends BaseRepository<LedgerEntry> {
  constructor() {
    super("ledger");
  }

  async createEntry(data: Omit<LedgerEntry, "id" | "createdAt">, tenantId: string): Promise<string> {
    const docRef = await this.db.collection(this.collectionName).add({
      ...data,
      tenantId,
      createdAt: new Date(),
    });
    return docRef.id;
  }

  async findByTenant(tenantId: string): Promise<(LedgerEntry & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as LedgerEntry & { id: string }));
  }
}
