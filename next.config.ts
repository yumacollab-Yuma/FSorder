import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent build-time static generation of API routes that need env vars
  experimental: {},
};

export default nextConfig;
