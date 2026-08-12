import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type RouteContext = {
  params: Promise<{
    segments: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const { segments } = await context.params;
  const url = new URL(
    `/api/storefront/products/${segments
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`,
    API_BASE_URL
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: `Products request failed: ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const { segments } = await context.params;
  const url = new URL(
    `/api/storefront/products/${segments
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`,
    API_BASE_URL
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const body = await request.text();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
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
    },
  });
}
