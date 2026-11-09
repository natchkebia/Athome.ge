import { NextRequest, NextResponse } from "next/server";

import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 },
    );
  }

  const url = new URL("/api/storefront/pickup-branches", API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: { ...upstreamHeaders(request),
      Accept: "application/json",
      "X-Lang": request.headers.get("x-lang") ?? "ka",
    },
    cache: "no-store",
  });
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.has("retry-after") ? { "Retry-After": response.headers.get("retry-after")! } : {}),
    },
  });
}
