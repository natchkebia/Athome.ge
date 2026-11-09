import { NextRequest, NextResponse } from "next/server";

import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const url = new URL("/api/storefront/banners", API_BASE_URL);
  const type = request.nextUrl.searchParams.get("type");

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  if (type && !url.searchParams.has("type")) {
    url.searchParams.set("type", type);
  }

  const response = await fetch(url, {
    headers: { ...upstreamHeaders(request),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: `Storefront banners request failed: ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
