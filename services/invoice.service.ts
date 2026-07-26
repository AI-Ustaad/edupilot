import { InvoiceRepository } from "@/repositories/invoice.repository";
import type { Invoice } from "@/repositories/invoice.repository";

export class InvoiceService {
  private repo: InvoiceRepository;

  constructor(repo?: InvoiceRepository) {
    this.repo = repo ?? new InvoiceRepository();
  }

  async createFromStripe(data: {
    tenantId: string;
    stripeInvoiceId: string;
    amountPaid: number;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<string> {
    const invoice: Omit<Invoice, "id"> = {
      tenantId: data.tenantId,
      amount: data.amountPaid,
      currency: data.currency,
      status: "paid",
      dueDate: data.periodEnd,
      paidAt: data.periodStart,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.repo.create(invoice, data.tenantId);
  }
}
