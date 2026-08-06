import type { Metadata } from "next";
import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ithome.ge";

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-lang") === "en" ? "en" : "ka";
  const kaPath = `/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
  const currentPath = locale === "en" ? `/en${kaPath}` : kaPath;
  let product: {
    name?: string;
    seo?: { metaTitle?: string; metaDescription?: string; ogImageUrl?: string } | null;
    images?: { url: string }[];
  } | null = null;

  if (API_BASE_URL) {
    try {
      const url = new URL(`/api/storefront/products/${encodeURIComponent(slug)}`, API_BASE_URL);
      url.searchParams.set("lang", locale);
      const response = await fetch(url, {
        headers: { Accept: "application/json", "X-Lang": locale },
        cache: "no-store",
      });
      if (response.ok) product = await response.json();
    } catch {
      // The page itself renders its normal error state if the backend is unavailable.
    }
  }

  const title = product?.seo?.metaTitle || product?.name || "Athome.ge";
  const description = product?.seo?.metaDescription;
  const image = product?.seo?.ogImageUrl || product?.images?.[0]?.url;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${currentPath}`,
      languages: {
        ka: `${SITE_URL}${kaPath}`,
        en: `${SITE_URL}/en${kaPath}`,
        "x-default": `${SITE_URL}${kaPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${currentPath}`,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
    other: { "og:type": "product" },
  };
}

export default function ProductMetadataLayout({ children }: Props) {
  return children;
}
