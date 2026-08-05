import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export type StorefrontBlogPost = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  thumbnailUrl?: string;
  author?: string;
  publishedAt?: string;
  tags?: string;
};

export type StorefrontBlogPostDetail = StorefrontBlogPost & {
  body?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type StorefrontBlogResponse = {
  items: StorefrontBlogPost[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type BlogListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
};

function getStorefrontUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return new URL(path, API_BASE_URL);
}

async function fetchStorefront<T>(url: URL) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-lang") === "en" ? "en" : "ka";
  url.searchParams.set("lang", locale);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Lang": locale,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function getStorefrontBlogPosts({
  page = 1,
  pageSize = 9,
  search,
  tag,
}: BlogListParams = {}) {
  const url = getStorefrontUrl("/api/storefront/blog");
  url.searchParams.set("Page", String(page));
  url.searchParams.set("PageSize", String(pageSize));

  if (search) url.searchParams.set("Search", search);
  if (tag) url.searchParams.set("Tag", tag);

  return fetchStorefront<StorefrontBlogResponse>(url);
}

export async function getStorefrontBlogPost(slug: string) {
  const url = getStorefrontUrl(
    `/api/storefront/blog/${encodeURIComponent(slug)}`
  );

  return fetchStorefront<StorefrontBlogPostDetail>(url);
}

export function formatBlogDate(date?: string) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat("ka-GE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function getBlogParagraphs(body?: string) {
  return (body ?? "")
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
