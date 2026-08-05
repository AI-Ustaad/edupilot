export interface IWebhookService {
  verifySignature(payload: any, signature: string): Promise<boolean>;
  processEvent(event: { type: string; data: any }): Promise<any>;
  routeEvent(eventType: string, payload: any): Promise<void>;
}
