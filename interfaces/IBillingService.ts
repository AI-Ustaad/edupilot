export interface IBillingService {
  createCheckoutSession(customerId: string, planId: string, tenantId: string): Promise<{ url?: string }>;
  processWebhook(payload: string, signature: string): Promise<{ received: boolean }>;
  getSubscription(tenantId: string): Promise<any>;
  activateSubscription(tenantId: string, planId: string): Promise<any>;
  cancelSubscription(tenantId: string): Promise<void>;
  generateInvoice(tenantId: string, period: string): Promise<any>;
}
