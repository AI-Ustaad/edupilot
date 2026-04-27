/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // 🔥 Production performance
  compress: true,

  // 🔥 Remove unnecessary headers exposure
  poweredByHeader: false,

  // 🔥 Optional: Enable if you use external images later
  images: {
    domains: [],
  },

  // 🔥 Fix for Firebase / Node modules (if needed later)
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
