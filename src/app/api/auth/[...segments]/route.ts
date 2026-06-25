import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type RouteContext = {
  params: Promise<{
    segments: string[];
  }>;
};

async function proxyAuthRequest(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const { segments } = await context.params;
  const url = new URL(
    `/api/auth/${segments.map(encodeURIComponent).join("/")}`,
    API_BASE_URL
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // arrayBuffer ინახავს binary-ს უცვლელად — საჭიროა multipart ფაილის ატვირთვაზე
  // (request.text() binary-ს აფუჭებდა). ცარიელ body-ზე undefined ვაგზავნით.
  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const buffer = await request.arrayBuffer();
    body = buffer.byteLength > 0 ? buffer : undefined;
  }

  const response = await fetch(url, {
    method: request.method,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
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

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyAuthRequest(request, context);
}
