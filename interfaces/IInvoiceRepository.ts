export interface IInvoiceRepository {
  findByTenant(tenantId: string): Promise<any[]>;
  findById(id: string, tenantId: string): Promise<any | null>;
  create(data: any, tenantId: string): Promise<string>;
  markAsPaid(id: string, tenantId: string): Promise<void>;
}
