// __tests__/utils/logger-mock.ts
export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
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
