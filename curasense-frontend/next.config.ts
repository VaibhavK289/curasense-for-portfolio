import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker (disable on Vercel)
  output: process.env.VERCEL ? undefined : "standalone",

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://vaibhavkandhway.dev',
             // Replace with your portfolio's domain
          },
          // Or, for more modern browsers, you can use Content-Security-Policy
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://vaibhavkandhway.dev", // Replace with your portfolio's domain
          },
        ],
      },
    ];
  },
};

export default nextConfig;

