import React from 'react';
import { renderToString } from 'react-dom/server';
import AppError from '@/app/error';
import GlobalError from '@/app/global-error';
import NotFound from '@/app/not-found';

describe('Phase 9 — Production Security Headers & Error Boundaries Verification', () => {
  describe('1. Production HTTP Security Headers (next.config.js)', () => {
    let headersList: Array<{ key: string; value: string }> = [];

    beforeAll(async () => {
      // Load next.config.js
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nextConfigExport = require('../../next.config.js');
      const resolvedConfig =
        typeof nextConfigExport === 'function'
          ? await nextConfigExport('phase-production-build', {})
          : await nextConfigExport;

      const customHeaders = await resolvedConfig.headers();
      const allRoutesRule = customHeaders.find((h: any) => h.source === '/(.*)');
      expect(allRoutesRule).toBeDefined();
      headersList = allRoutesRule.headers;
    });

    it('enforces X-Content-Type-Options: nosniff', () => {
      const header = headersList.find((h) => h.key === 'X-Content-Type-Options');
      expect(header).toBeDefined();
      expect(header?.value).toBe('nosniff');
    });

    it('enforces X-Frame-Options: DENY against clickjacking', () => {
      const header = headersList.find((h) => h.key === 'X-Frame-Options');
      expect(header).toBeDefined();
      expect(header?.value).toBe('DENY');
    });

    it('enforces Referrer-Policy: strict-origin-when-cross-origin', () => {
      const header = headersList.find((h) => h.key === 'Referrer-Policy');
      expect(header).toBeDefined();
      expect(header?.value).toBe('strict-origin-when-cross-origin');
    });

    it('enforces Permissions-Policy allowing self camera and blocking unauthorized sensors', () => {
      const header = headersList.find((h) => h.key === 'Permissions-Policy');
      expect(header).toBeDefined();
      expect(header?.value).toBe('camera=(self), microphone=(), geolocation=()');
    });

    it('enforces Strict-Transport-Security (HSTS) with 2-year max-age, includeSubDomains, and preload', () => {
      const header = headersList.find((h) => h.key === 'Strict-Transport-Security');
      expect(header).toBeDefined();
      expect(header?.value).toBe('max-age=63072000; includeSubDomains; preload');
    });
  });

  describe('2. Global App Error Boundary (app/error.tsx)', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('renders gracefully without leaking raw stack traces to the user', () => {
      const mockError = new Error('Database connection failed') as Error & { digest?: string };
      mockError.stack = 'Error: Database connection failed\n    at /secret/path/internal.ts:42:15';
      mockError.digest = 'ERR_SRV_9921';
      const mockReset = jest.fn();

      const html = renderToString(React.createElement(AppError, { error: mockError, reset: mockReset }));

      expect(html).toContain('Something went wrong!');
      expect(html).toContain('An unexpected error occurred while processing your request.');
      expect(html).toContain('Reference ID: ERR_SRV_9921');
      // Must NOT leak raw internal stack trace into user-facing markup
      expect(html).not.toContain('/secret/path/internal.ts:42:15');
      expect(html).not.toContain('Database connection failed');
    });

    it('contains Try Again action and Return to Dashboard navigation', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      const html = renderToString(React.createElement(AppError, { error: mockError, reset: mockReset }));

      expect(html).toContain('Try Again');
      expect(html).toContain('Return to Dashboard');
      expect(html).toContain('href="/dashboard"');
    });
  });

  describe('3. Root Global Error Boundary (app/global-error.tsx)', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('renders root html and body tags required by Next.js App Router', () => {
      const mockError = new Error('Root layout rendering crashed') as Error & { digest?: string };
      mockError.digest = 'CRIT_LAYOUT_001';
      const mockReset = jest.fn();

      const html = renderToString(React.createElement(GlobalError, { error: mockError, reset: mockReset }));

      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<body');
      expect(html).toContain('Critical System Error');
      expect(html).toContain('Reference ID: CRIT_LAYOUT_001');
    });

    it('does not leak raw stack traces and provides dashboard navigation', () => {
      const mockError = new Error('Sensitive internals') as Error & { digest?: string };
      mockError.stack = 'Error: Sensitive internals\n    at /var/secrets/key.ts:1:1';
      const mockReset = jest.fn();

      const html = renderToString(React.createElement(GlobalError, { error: mockError, reset: mockReset }));

      expect(html).not.toContain('/var/secrets/key.ts');
      expect(html).toContain('Try Again');
      expect(html).toContain('Return to Dashboard');
      expect(html).toContain('href="/dashboard"');
    });
  });

  describe('4. Custom 404 Fallback UI (app/not-found.tsx)', () => {
    it('renders page not found with dashboard and home navigation actions', () => {
      const html = renderToString(React.createElement(NotFound));

      expect(html).toContain('404 Not Found');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('Return to Dashboard');
      expect(html).toContain('href="/dashboard"');
      expect(html).toContain('Home');
      expect(html).toContain('href="/"');
    });
  });
});
