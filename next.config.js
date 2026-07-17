const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
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

// =========================================================
// 🚨 Sentry Configuration (مستقبل میں Use کرنے کے لیے تیار)
// فی الحال Comment کر دیا گیا ہے تاکہ Build تیز ہو۔
// جب آپ Sentry کو فعال کرنا چاہیں تو اسے Uncomment کر دیں۔
// =========================================================
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
