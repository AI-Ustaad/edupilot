// lib/queue/providers/memory-queue.provider.ts
import { QueueJob, QueueOptions, IQueueProvider } from "../queue";

export interface MemoryQueueJob extends QueueJob {
  _resolve?: (value: string) => void;
  _reject?: (error: Error) => void;
}

export class MemoryQueueProvider implements IQueueProvider {
  private jobs: Map<string, MemoryQueueJob> = new Map();
  private processing: Map<string, MemoryQueueJob> = new Map();
  private options: QueueOptions;
  private isProcessing = false;

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = {
      defaultPriority: options.defaultPriority || 0,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      pollInterval: options.pollInterval || 100,
      concurrency: options.concurrency || 5,
    };
  }

  async add<T = any>(type: string, payload: T, options?: { priority?: number; delay?: number; tenantId?: string }): Promise<string> {
    const job: MemoryQueueJob = {
      id: crypto.randomUUID(),
      type,
      payload,
      tenantId: options?.tenantId || "",
      priority: options?.priority || this.options.defaultPriority,
      attempts: 0,
      maxAttempts: this.options.maxRetries,
      delay: options?.delay || 0,
      scheduledAt: new Date(Date.now() + (options?.delay || 0)),
      createdAt: new Date(),
      status: options?.delay && options.delay > 0 ? "delayed" : "pending",
    };

    this.jobs.set(job.id, job);
    return job.id;
  }

  async getJob(id: string): Promise<QueueJob | null> {
    return this.jobs.get(id) || null;
  }

  async removeJob(id: string): Promise<void> {
    this.jobs.delete(id);
    this.processing.delete(id);
  }

  getStats() {
    return {
      pending: Array.from(this.jobs.values()).filter(j => j.status === "pending").length,
      active: Array.from(this.jobs.values()).filter(j => j.status === "active").length,
      completed: Array.from(this.jobs.values()).filter(j => j.status === "completed").length,
      failed: Array.from(this.jobs.values()).filter(j => j.status === "failed").length,
    };
  }

  async clear(): Promise<void> {
    this.jobs.clear();
    this.processing.clear();
  }

   async processNext(handler: (job: QueueJob) => Promise<void>): Promise<void> {
    const pending = Array.from(this.jobs.values())
      .filter(j => j.status === "pending" && j.scheduledAt! <= new Date())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (pending.length === 0) return;

    const job = pending[0];
    job.status = "active";
    job.attempts = (job.attempts || 0) + 1;
    job.startedAt = new Date();
    this.processing.set(job.id, job);

    try {
      await handler(job);
      job.status = "completed";
      job.completedAt = new Date();
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      job.finishedAt = new Date();
      
      if ((job.attempts || 0) < (job.maxAttempts || 0)) {
        job.status = "pending";
        job.scheduledAt = new Date(Date.now() + (this.options.retryDelay || 1000));
      }
    } finally {
      this.processing.delete(job.id);
    }
  }
}
