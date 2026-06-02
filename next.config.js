const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/v1/:path*" },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
