import { NextRequest, NextResponse } from "next/server";

import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const url = new URL("/api/storefront/checkout", API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  const body = await request.text();

  const response = await fetch(url, {
    method: "POST",
    headers: { ...upstreamHeaders(request),
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      "X-Lang": request.headers.get("x-lang") ?? "ka",
      // Authorization is optional — guest checkout works without it.
      ...(request.headers.get("authorization")
        ? { Authorization: request.headers.get("authorization") as string }
        : {}),
    },
    body,
    cache: "no-store",
  });

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
      ...(response.headers.has("retry-after") ? { "Retry-After": response.headers.get("retry-after")! } : {}),
    },
  });
}
