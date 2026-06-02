const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  // آپ کی موجودہ PWA کنفیگ وغیرہ اگر ہو تو یہاں رکھیں
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/v1/:path*",
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
