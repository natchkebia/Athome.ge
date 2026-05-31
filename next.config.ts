import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "athome.ge",
      },
      {
        protocol: "https",
        hostname: "imgstore.alta.ge",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "ultra.ge",
      },
      {
        protocol: "https",
        hostname: "www.ultra.ge",
      },
    ],
  },
};

export default nextConfig;
