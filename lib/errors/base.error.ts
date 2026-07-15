export class BaseApplicationError extends Error {
  constructor(public message: string, public statusCode: number = 500, public code: string = "INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
  }
}
