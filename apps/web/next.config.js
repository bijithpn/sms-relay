/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sms-relay/ui", "@sms-relay/types", "@sms-relay/config"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
