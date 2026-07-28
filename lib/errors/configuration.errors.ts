import { AppError } from "@/errors/AppError";

export class TenantResolutionError extends AppError {
  constructor(message = "Unable to resolve tenant from current context") {
    super(message, 400, "TENANT_RESOLUTION_ERROR");
  }
}

export class ConfigurationNotFoundError extends AppError {
  constructor(tenantId: string) {
    super(`Configuration not found for tenant: ${tenantId}`, 404, "CONFIGURATION_NOT_FOUND");
  }
}

export class ConfigurationValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "CONFIGURATION_VALIDATION_ERROR");
  }
}

export class ConfigurationInvalidError extends AppError {
  constructor(message: string) {
    super(message, 422, "CONFIGURATION_INVALID");
  }
}

export class ConfigurationStateError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFIGURATION_STATE_ERROR");
  }
}
