// lib/logger/logger.ts
export type LogLevel = "info" | "error" | "warn" | "debug" | "audit" | "security" | "ocr" | "ai" | "performance" | "api" | "repository" | "validation";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  tenantId?: string;
  path?: string;
  method?: string;
  duration?: number;
  requestId?: string;
  traceId?: string;
  metadata?: Record<string, any>;
}

function serializeValue(val: any, depth = 0): any {
  if (depth > 5) return "[MaxDepth]";
  if (val instanceof Error) {
    return {
      name: val.name,
      message: val.message,
      stack: val.stack,
      code: (val as any).code,
      details: (val as any).details,
      ...(val as any),
    };
  }
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const res: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      res[key] = serializeValue(val[key], depth + 1);
    }
    return res;
  }
  if (Array.isArray(val)) {
    return val.map((item) => serializeValue(item, depth + 1));
  }
  return val;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: Partial<Omit<LogEntry, "level" | "message" | "timestamp">>) {
    const serializedContext = context ? serializeValue(context) : {};
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...serializedContext,
    };
    if (level === "error") console.error(this.formatLog(entry));
    else console.log(this.formatLog(entry));
  }

  info(message: string, context?: any) { this.log("info", message, context); }
  error(message: string, context?: any) { this.log("error", message, context); }
  warn(message: string, context?: any) { this.log("warn", message, context); }
  debug(message: string, context?: any) { this.log("debug", message, context); }
  audit(action: string, metadata?: any, context?: any) { this.log("audit", action, { ...context, metadata }); }
  security(message: string, context?: any) { this.log("security", message, context); }
  ocr(message: string, context?: any) { this.log("ocr", message, context); }
  ai(message: string, context?: any) { this.log("ai", message, context); }
  performance(message: string, context?: any) { this.log("performance", message, context); }
  api(message: string, context?: any) { this.log("api", message, context); }
  repository(message: string, context?: any) { this.log("repository", message, context); }
  validation(message: string, context?: any) { this.log("validation", message, context); }

  logRequest(req: Request, duration: number, status?: number) {
    const url = new URL(req.url);
    this.api(`${req.method} ${url.pathname} completed in ${duration}ms`, {
      method: req.method,
      path: url.pathname,
      duration,
      metadata: { status },
    });
  }
}

export const logger = new Logger();
