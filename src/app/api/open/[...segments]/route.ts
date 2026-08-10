import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type RouteContext = { params: Promise<{ segments: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json({ message: "NEXT_PUBLIC_API_URL is not configured" }, { status: 500 });
  }

  const { segments } = await context.params;
  const url = new URL(`/api/open/${segments.map(encodeURIComponent).join("/")}`, API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Lang": request.headers.get("x-lang") ?? "ka",
    },
    cache: "no-store",
  });

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
