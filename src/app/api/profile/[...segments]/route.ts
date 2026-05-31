import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type RouteContext = {
  params: Promise<{
    segments: string[];
  }>;
};

async function proxyProfileRequest(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const { segments } = await context.params;
  const url = new URL(
    `/api/profile/${segments.map(encodeURIComponent).join("/")}`,
    API_BASE_URL
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const bodyText =
    request.method === "GET" || request.method === "HEAD"
      ? ""
      : await request.text();
  const body = bodyText.trim() ? bodyText : undefined;
  const contentType = request.headers.get("content-type");

  const response = await fetch(url, {
    method: request.method,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
      ...(body && contentType ? { "Content-Type": contentType } : {}),
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

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyProfileRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyProfileRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyProfileRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyProfileRequest(request, context);
}
