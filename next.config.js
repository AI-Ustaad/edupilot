/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This ensures Next.js uses the modern build system
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
