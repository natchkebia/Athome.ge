import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
   output: "standalone",
=======
  // PM2 deploy runs the self-contained `.next/standalone/server.js` bundle.
  output: "standalone",
>>>>>>> ca6d4df8351e30d05ce75f64aab84fd518cda22a
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
