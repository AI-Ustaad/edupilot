// lib/workers/worker.ts
export interface WorkerJob {
  id: string;
  type: string;
  payload: Record<string, any>;
  tenantId: string;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  error?: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface WorkerOptions {
  concurrency: number;
  maxRetries: number;
  retryDelay: number;
  pollInterval: number;
}

export interface IWorker {
  start(): Promise<void>;
  stop(): Promise<void>;
  process(job: WorkerJob): Promise<void>;
  getStats(): { active: number; pending: number; completed: number; failed: number };
}

export abstract class BaseWorker implements IWorker {
  protected options: WorkerOptions;
  protected isRunning = false;
  protected activeJobs = new Map<string, WorkerJob>();

  constructor(options: Partial<WorkerOptions> = {}) {
    this.options = {
      concurrency: options.concurrency || 5,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      pollInterval: options.pollInterval || 1000,
    };
  }

  abstract process(job: WorkerJob): Promise<void>;

  async start(): Promise<void> {
    this.isRunning = true;
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  getStats() {
    return {
      active: this.activeJobs.size,
      pending: 0,
      completed: 0,
      failed: 0,
    };
  }
}
