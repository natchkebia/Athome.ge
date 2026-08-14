import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { headers } from "next/headers";
import { StorefrontLocaleProvider } from "@/lib/i18n/useStorefrontLocale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ithome.ge"),
  applicationName: "Athome.ge",
  title: {
    default: "Athome.ge — ტექნიკის ონლაინ მაღაზია",
    template: "%s | Athome.ge",
  },
  description:
    "კომპიუტერული ტექნიკა, ლეპტოპები, მონიტორები, კომპონენტები და აქსესუარები — შეიძინეთ ონლაინ Athome.ge-ზე.",
  keywords: [
    "Athome.ge",
    "კომპიუტერული ტექნიკა",
    "ლეპტოპები",
    "კომპიუტერის ნაწილები",
    "მონიტორები",
    "ტექნიკის ონლაინ მაღაზია",
  ],
  openGraph: {
    type: "website",
    siteName: "Athome.ge",
    title: "Athome.ge — ტექნიკის ონლაინ მაღაზია",
    description:
      "კომპიუტერული ტექნიკა, ლეპტოპები, მონიტორები, კომპონენტები და აქსესუარები.",
    url: "https://ithome.ge",
  },
  icons: {
    icon: [{ url: "/icons/favicon-transparent.png", type: "image/png", sizes: "256x256" }],
    shortcut: "/icons/favicon-transparent.png",
    apple: "/icons/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-lang") === "en" ? "en" : "ka";
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StorefrontLocaleProvider locale={locale}>
          <ClientLayout>{children}</ClientLayout>
        </StorefrontLocaleProvider>
      </body>
    </html>
  );
}
