/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_URL || 'http://127.0.0.1:3001';

const nextConfig = {
  transpilePackages: ["@sms-relay/ui", "@sms-relay/types", "@sms-relay/config"],
  experimental: {
    allowedDevOrigins: [
      "*.ngrok-free.app", 
      "*.trycloudflare.com", 
      "*.ngrok.io",
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
