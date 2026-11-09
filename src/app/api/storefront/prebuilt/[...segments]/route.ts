import { NextRequest } from "next/server";

import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";

type RouteContext = { params: Promise<{ segments: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return Response.json({ message: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  }
  const { segments } = await context.params;
  const url = new URL(
    `/api/storefront/prebuilt/${segments.map(encodeURIComponent).join("/")}`,
    API_BASE_URL,
  );
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  const response = await fetch(url, {
    method: request.method,
    headers: { ...upstreamHeaders(request),
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.has("retry-after") ? { "Retry-After": response.headers.get("retry-after")! } : {}), },
  });
}

export const GET = proxy;
export const POST = proxy;
