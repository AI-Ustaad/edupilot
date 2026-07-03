const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. React Strict Mode: بمشکل Errors کو Debug کرنے میں مدد دیتا ہے
  reactStrictMode: true,

  // 2. Image Optimization: Next.js Image Component کے لیے External Domains کی اجازت
  // آپ یہاں اپنے Firebase Storage, AWS S3 یا دوسرے CDN کے Domains شامل کر سکتے ہیں
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // فی الحال سب کو اجازت ہے، after میں آپ اسے مخصوص کر سکتے ہیں
      },
    ],
  },

  // 3. Security Headers (Enterprise SaaS کے لیے لازمی)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // Clickjacking سے بچاؤ
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // 4. Webpack Config (xlsx کا مسئلہ محفوظ رکھنے کے لیے)
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
