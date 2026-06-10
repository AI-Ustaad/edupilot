const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  // ✅ FIX: Next.js 14.2.3 کے لیے experimental option
  experimental: {
    serverComponentsExternalPackages: ['exceljs'],
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
