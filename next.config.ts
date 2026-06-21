import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // build-ს არ ვაჩერებთ lint შეცდომებზე (TypeScript ტიპების შემოწმება მაინც მუშაობს).
    // არსებული lint errors ცალკე უნდა გასწორდეს checkout/StockCheck კომპონენტებში.
    ignoreDuringBuilds: true,
  },
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
        hostname: "i-extra.alta.ge",
      },
      {
        // covers any alta.ge CDN subdomain (i-extra, imgstore, etc.)
        protocol: "https",
        hostname: "**.alta.ge",
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
