import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PM2 deploy runs the self-contained `.next/standalone/server.js` bundle.
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    const policy = [
      "default-src 'self'",
      // Next hydration and existing inline styles need these until nonce support is added.
      "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https:" + (process.env.NODE_ENV === "development" ? " ws: wss:" : ""),
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "Content-Security-Policy", value: policy },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
  eslint: {
    // build-ს არ ვაჩერებთ lint შეცდომებზე (TypeScript ტიპების შემოწმება მაინც მუშაობს).
    // არსებული lint errors ცალკე უნდა გასწორდეს checkout/StockCheck კომპონენტებში.
    ignoreDuringBuilds: true,
  },
  images: {
    // ბრაუზერი პირდაპირ წყაროდან იღებს სურათს (/_next/image-ის 403-ის გარეშე).
    // responsive ზომებს ?w=-ით ვმართავთ — იხ. src/lib/media/img.ts.
    unoptimized: true,
  },
};

export default nextConfig;
