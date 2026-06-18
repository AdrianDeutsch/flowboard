import type { NextConfig } from "next";

// API traffic is proxied to the backend by the catch-all route handler at
// app/api/[...path]/route.ts (Node runtime), not by a rewrite — that keeps the
// proxy off the edge runtime and free of build-time env coupling.
const nextConfig: NextConfig = {};

export default nextConfig;
