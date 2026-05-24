import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

// Mock fetch globally
global.fetch = jest.fn();
