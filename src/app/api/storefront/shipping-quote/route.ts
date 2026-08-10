import { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    return Response.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 },
    );
  }

  const url = new URL("/api/storefront/shipping-quote", API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      "X-Lang": request.headers.get("x-lang") ?? "ka",
    },
    body: await request.text(),
    cache: "no-store",
  });

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
