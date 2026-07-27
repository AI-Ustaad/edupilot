// interfaces/IEventOutboxRepository.ts
export interface IEventOutboxRepository {
  claimPending(...args: any[]): Promise<any>;
  claimSubscriber(...args: any[]): Promise<any>;
  complete(...args: any[]): Promise<any>;
  completeSubscriber(...args: any[]): Promise<any>;
  enqueue(...args: any[]): Promise<any>;
  fail(...args: any[]): Promise<any>;
  releaseSubscriber(...args: any[]): Promise<any>;
}
