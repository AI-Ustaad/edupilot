const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  // ✅ Next.js 14.2.3 compatible - exceljs کو server-side external رکھیں
  experimental: {
    serverComponentsExternalPackages: ['exceljs', '@react-pdf/renderer'],
  },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/v1/:path*" },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

// Injected content via Sentry wizard below
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  org: "ai-ustaad",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
