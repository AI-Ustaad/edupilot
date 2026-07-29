import { jest } from "@jest/globals";

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
  audit: jest.fn(),
  security: jest.fn(),
  ocr: jest.fn(),
  ai: jest.fn(),
  performance: jest.fn(),
  api: jest.fn(),
  repository: jest.fn(),
  validation: jest.fn(),
  logRequest: jest.fn(),
};

export function setupLoggerMock() {
  jest.mock("@/lib/logger/logger", () => ({
    logger: mockLogger,
    createLogger: jest.fn().mockReturnValue(mockLogger),
  }));
}

export function clearLoggerMocks() {
  Object.values(mockLogger).forEach(fn => {
    if (jest.isMockFunction(fn)) {
      fn.mockClear();
    }
  });
}
