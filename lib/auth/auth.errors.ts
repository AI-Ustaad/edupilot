import { BaseApplicationError } from "../errors/base.error";

export class AuthenticationError extends BaseApplicationError {
  constructor(message: string, statusCode = 401, code = "UNAUTHORIZED") {
    super(message, statusCode, code);
  }
}

export class UserProfileNotFoundError extends AuthenticationError {
  constructor(uid: string) {
    super(`User profile not found in system for UID: ${uid}`, 403, "USER_NOT_FOUND");
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor() {
    super("Authentication session expired or invalid.", 401, "INVALID_TOKEN");
  }
}
