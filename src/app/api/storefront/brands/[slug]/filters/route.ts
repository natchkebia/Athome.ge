import { NextRequest } from "next/server";

import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";
type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) return Response.json({ message: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  const { slug } = await context.params;
  const url = new URL(`/api/storefront/brands/${encodeURIComponent(slug)}/filters`, API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  const response = await fetch(url, { headers: { ...upstreamHeaders(request), Accept: "application/json" }, cache: "no-store" });
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.has("retry-after") ? { "Retry-After": response.headers.get("retry-after")! } : {}), },
  });
}
