import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const url = new URL("/api/storefront/brands/featured", API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  const limit = request.nextUrl.searchParams.get("limit");

  if (limit) {
    url.searchParams.set("limit", limit);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: `Featured brands request failed: ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
