import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['swisseph-wasm'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/swisseph-wasm/wasm/swisseph.wasm'],
  },
};

export default nextConfig;
