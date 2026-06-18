import type { NextConfig } from "next";

// Where the Express backend lives. In production (Vercel) this is the Render
// service URL; locally it falls back to the dev server. Read at build time.
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  /**
   * Proxy all /api/* traffic to the backend so the browser only ever talks to
   * this origin (BFF pattern). The auth cookie the backend sets then stays
   * first-party, keeping sameSite=lax valid across the Vercel + Render split.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
