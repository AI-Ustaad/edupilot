// interfaces/IInvoiceService.ts
export interface IInvoiceService {
  createFromStripe(data: { tenantId: string; stripeInvoiceId: string; amountPaid: number; currency: string; periodStart: Date; periodEnd: Date; }): Promise<string>;
}
