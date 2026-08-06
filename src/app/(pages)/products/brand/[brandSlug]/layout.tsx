import type { Metadata } from "next";
import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ithome.ge";

type Props = { children: React.ReactNode; params: Promise<{ brandSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const kaPath = `/products/brand/${encodeURIComponent(brandSlug)}`;
  const currentPath = locale === "en" ? `/en${kaPath}` : kaPath;
  let data: { name?: string; description?: string; logoUrl?: string; seo?: { metaTitle?: string; metaDescription?: string; ogImageUrl?: string } | null } | null = null;

  if (API_BASE_URL) {
    try {
      const url = new URL(`/api/storefront/brands/${encodeURIComponent(brandSlug)}`, API_BASE_URL);
      url.searchParams.set("lang", locale);
      const response = await fetch(url, { headers: { Accept: "application/json", "X-Lang": locale }, cache: "no-store" });
      if (response.ok) data = await response.json();
    } catch {
      // Keep route metadata usable with the fallback title during API outages.
    }
  }

  const title = data?.seo?.metaTitle || data?.name || "Athome.ge";
  const description = data?.seo?.metaDescription || data?.description;
  const image = data?.seo?.ogImageUrl || data?.logoUrl;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${currentPath}`, languages: { ka: `${SITE_URL}${kaPath}`, en: `${SITE_URL}/en${kaPath}`, "x-default": `${SITE_URL}${kaPath}` } },
    openGraph: { title, description, url: `${SITE_URL}${currentPath}`, ...(image ? { images: [image] } : {}) },
  };
}

export default function BrandMetadataLayout({ children }: Props) { return children; }
