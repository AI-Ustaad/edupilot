// lib/queue/queue.ts
export interface QueueJob<T = any> {
  id: string;
  type: string;
  payload: T;
  tenantId?: string;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  delay?: number;
  scheduledAt?: Date;
  status: "pending" | "active" | "completed" | "failed" | "delayed";
  error?: string;
  createdAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  finishedAt?: Date;
}

export interface QueueOptions {
  defaultPriority?: number;
  maxRetries?: number;
  retryDelay?: number;
  pollInterval?: number;
  concurrency?: number;
}

export interface IQueueProvider {
  add<T = any>(type: string, payload: T, options?: { priority?: number; delay?: number; tenantId?: string }): Promise<string>;
  getJob(id: string): Promise<QueueJob | null>;
  removeJob(id: string): Promise<void>;
  getStats(): { pending: number; active: number; completed: number; failed: number };
  clear(): Promise<void>;
  processNext<T = any>(handler: (job: QueueJob<T>) => Promise<void>): Promise<void>;
}

import { MemoryQueueProvider } from "./providers/memory-queue.provider";

export class QueueService {
  private provider: IQueueProvider;
  private static instance: QueueService;
  private handlers: Map<string, (job: QueueJob) => Promise<void>> = new Map();
  private isProcessing = false;
  private processingPromise: Promise<void> | null = null;

  private constructor(provider: IQueueProvider) {
    this.provider = provider;
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService(new MemoryQueueProvider());
    }
    return QueueService.instance;
  }

  async add<T = any>(type: string, payload: T, options?: { priority?: number; delay?: number; tenantId?: string }): Promise<string> {
    return this.provider.add(type, payload, options);
  }

  async process<T = any>(type: string, handler: (job: QueueJob<T>) => Promise<void>): Promise<void> {
    this.handlers.set(type, handler as (job: QueueJob) => Promise<void>);
    
    if (!this.isProcessing) {
      this.isProcessing = true;
      this.processingPromise = this.startProcessingLoop();
    }
  }

  private async startProcessingLoop(): Promise<void> {
    while (this.isProcessing) {
      try {
        for (const [type, handler] of this.handlers.entries()) {
          await this.provider.processNext(handler);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error("[Queue] Processing error:", error);
      }
    }
  }

  async getJob(id: string): Promise<QueueJob | null> {
    return this.provider.getJob(id);
  }

  async removeJob(id: string): Promise<void> {
    return this.provider.removeJob(id);
  }

  getStats() {
    return this.provider.getStats();
  }

  async clear(): Promise<void> {
    return this.provider.clear();
  }

  async stop(): Promise<void> {
    this.isProcessing = false;
    if (this.processingPromise) {
      await this.processingPromise;
    }
  }
}

export const queueService = QueueService.getInstance();
