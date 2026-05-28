import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Security headers (supplemented by vercel.json)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // Redirect old scan routes to new analyses routes
  async redirects() {
    return [
      {
        source: "/scans",
        destination: "/analyses",
        permanent: true,
      },
      {
        source: "/scans/new",
        destination: "/analyses/new",
        permanent: true,
      },
      {
        source: "/scans/:id",
        destination: "/analyses/:id",
        permanent: true,
      },
    ];
  },

  // Performance
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
