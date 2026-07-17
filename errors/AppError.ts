// errors/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class BusinessError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, "BUSINESS_ERROR", details);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class OCRException extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, "OCR_ERROR", details);
  }
}

export class ProviderException extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, "PROVIDER_ERROR", details);
  }
}

export class RepositoryException extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, "REPOSITORY_ERROR", details);
  }
}

export class RateLimitException extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class SubscriptionLimitException extends AppError {
  constructor(message = "Subscription limit reached") {
    super(message, 403, "SUBSCRIPTION_LIMIT");
  }
}
