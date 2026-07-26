import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { IInvoiceRepository } from "@/interfaces/IInvoiceRepository";
import { BaseRepository } from "./base.repository";

export interface Invoice {
  id?: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "canceled";
  dueDate: Date;
  paidAt?: Date;
  createdAt?: any;
  updatedAt?: any;
}

export class InvoiceRepository extends BaseRepository<Invoice> implements IInvoiceRepository {
  constructor() {
    super("invoices");
  }

  async findByTenant(tenantId: string): Promise<Invoice[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
  }

  async markAsPaid(id: string, tenantId: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).update({
      status: "paid",
      paidAt: new Date(),
      updatedAt: dbTimestamp,
    });
  }
}
