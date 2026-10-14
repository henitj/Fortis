import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Live-preview domains are development-only; production uses the deployment's own origin.
  allowedDevOrigins: ["127.0.0.1", "*.e2b.app"],
  devIndicators: false,
};

export default nextConfig;
