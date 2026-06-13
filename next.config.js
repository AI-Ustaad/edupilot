const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/v1/:path*" },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
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

module.exports = withNextIntl(nextConfig);

// Sentry temporarily disabled for debugging
// const { withSentryConfig } = require("@sentry/nextjs");
// module.exports = withSentryConfig(module.exports, {
//   org: "ai-ustaad",
//   project: "javascript-nextjs",
//   silent: !process.env.CI,
//   widenClientFileUpload: true,
//   webpack: {
//     automaticVercelMonitors: true,
//     treeshake: {
//       removeDebugLogging: true,
//     },
//   },
// });
