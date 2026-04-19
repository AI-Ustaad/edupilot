/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    // future features ke liye safe rakh rahe hain
  },

  // Optional: API size limit (future SaaS use)
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
