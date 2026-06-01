const nextConfig = {
  // آپ کی موجودہ PWA کنفیگ (اگر ہے تو یہاں رکھیں)
  // ...
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
