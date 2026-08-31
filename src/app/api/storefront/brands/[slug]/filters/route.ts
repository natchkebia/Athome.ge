import { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) return Response.json({ message: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  const { slug } = await context.params;
  const url = new URL(`/api/storefront/brands/${encodeURIComponent(slug)}/filters`, API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
