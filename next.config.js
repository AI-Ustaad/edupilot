const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/v1/:path*" },
    ];
  },

  // ✅ CRITICAL: Mark xlsx as server-only external package
  webpack: (config, { isServer }) => {
    if (isServer) {
      // xlsx کو server-side external رکھیں تاکہ webpack bundle نہ کرے
      config.externals = config.externals || [];
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = async (ctx) => {
          const result = await originalExternals(ctx);
          if (ctx.request === 'xlsx') return 'commonjs xlsx';
          return result;
        };
      } else if (Array.isArray(config.externals)) {
        config.externals.push(function({ request }, callback) {
          if (request === 'xlsx') {
            return callback(null, 'commonjs xlsx');
          }
          callback();
        });
      }
    }
    return config;
  },
};

// Apply next-intl plugin
const configWithIntl = withNextIntl(nextConfig);

// Injected content via Sentry wizard below
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(configWithIntl, {
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
