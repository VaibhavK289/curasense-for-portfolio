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
};

export default nextConfig;
