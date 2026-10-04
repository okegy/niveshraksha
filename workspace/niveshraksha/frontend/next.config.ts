import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression is left to the reverse proxy/CDN in production deployments;
  // identity-encoded responses also keep local preview tooling simple.
  compress: false,
};

export default nextConfig;
