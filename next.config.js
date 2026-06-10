const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  // ✅ Next.js 14.2.3 compatible config
  experimental: {
    serverComponentsExternalPackages: ['exceljs', '@react-pdf/renderer'],
  },

  // Server-side runtime
  serverRuntimeConfig: {},

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/v1/:path*" },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

// Sentry wizard config
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
    // ✅ Force exceljs to be treated as external
    externals: (config) => {
      config.externals = config.externals || [];
      config.externals.push('exceljs');
      return config;
    },
  },
});
