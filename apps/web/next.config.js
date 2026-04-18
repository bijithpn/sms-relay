/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_URL || 'http://127.0.0.1:3001';

const nextConfig = {
  transpilePackages: ["@sms-relay/ui", "@sms-relay/types", "@sms-relay/config"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
