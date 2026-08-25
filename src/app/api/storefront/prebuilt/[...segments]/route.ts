import { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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
    headers: {
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
