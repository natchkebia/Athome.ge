import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const { slug } = await context.params;
  const url = new URL(
    `/api/storefront/categories/${encodeURIComponent(slug)}`,
    API_BASE_URL
  );
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  const response = await fetch(
    url,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: `Category request failed: ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
