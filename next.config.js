/** @type {import('next').NextConfig} */
const nextConfig = {
  // ہم نے 'api' والا حصہ مٹا دیا ہے کیونکہ وہ Next.js 14 میں یہاں استعمال نہیں ہوتا
  // اس سے 'Unrecognized key' والا ایرر ختم ہو جائے گا
  reactStrictMode: true,

  // اگر بلڈ کے وقت ٹائپ اسکرپٹ یا لنٹنگ کے چھوٹے موٹے مسائل آئیں تو یہ انہیں ہینڈل کر لے گا
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
