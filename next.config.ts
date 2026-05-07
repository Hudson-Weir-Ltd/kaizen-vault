import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Validate env at build time. Throws if required vars are missing/invalid.
// Skipped automatically when SKIP_ENV_VALIDATION=1 (e.g. lint-only CI jobs).
import "./env";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Stage C-1.1: tighten remotePatterns to the Kaizen Supabase storage host
    // once the project URL is known.
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withBundleAnalyzer(nextConfig);
