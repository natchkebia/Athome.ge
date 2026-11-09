import { NextRequest, NextResponse } from "next/server";

import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 },
    );
  }

  const { orderNumber } = await context.params;
  const url = new URL(
    `/api/storefront/orders/${encodeURIComponent(orderNumber)}/payment-status`,
    API_BASE_URL,
  );
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: { ...upstreamHeaders(request),
      Accept: "application/json",
      ...(request.headers.get("authorization")
        ? { Authorization: request.headers.get("authorization") as string }
        : {}),
      ...(request.headers.get("x-lang")
        ? { "X-Lang": request.headers.get("x-lang") as string }
        : {}),
    },
    cache: "no-store",
  });

  if (response.status === 204) return new Response(null, { status: 204 });

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.has("retry-after") ? { "Retry-After": response.headers.get("retry-after")! } : {}),
    },
  });
}
