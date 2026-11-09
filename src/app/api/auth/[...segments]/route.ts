import { NextRequest, NextResponse } from "next/server";
import { UPSTREAM_API_URL as API_BASE_URL, upstreamHeaders } from "@/lib/api/upstream";

const RT_COOKIE = "athome_rt";
const RT_MAX_AGE = 7 * 24 * 60 * 60;
const ISSUES_TOKENS = new Set(["login", "social", "refresh-token"]);
const NEEDS_TOKEN = new Set(["refresh-token", "logout"]);
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/api/auth" };
type RouteContext = { params: Promise<{ segments: string[] }> };

function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(RT_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

async function proxyAuthRequest(request: NextRequest, context: RouteContext) {
  if (!API_BASE_URL) {
    return NextResponse.json({ message: "API upstream is not configured" }, { status: 500 });
  }
  const { segments } = await context.params;
  const action = segments.join("/");
  if ((ISSUES_TOKENS.has(action) || NEEDS_TOKEN.has(action)) && request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
  }
  const url = new URL(`/api/auth/${segments.map(encodeURIComponent).join("/")}`, API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  let body: ArrayBuffer | string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const buffer = await request.arrayBuffer();
    body = buffer.byteLength > 0 ? buffer : undefined;
  }

  if (NEEDS_TOKEN.has(action)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
    let foreignOrigin = false;
    if (origin) {
      try { foreignOrigin = new URL(origin).host !== host; } catch { foreignOrigin = true; }
    }
    if (request.headers.get("sec-fetch-site") === "cross-site" || foreignOrigin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    let payload: Record<string, unknown> = {};
    if (body) {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(body as ArrayBuffer));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) payload = parsed;
      } catch { /* Cookie-based requests may have an empty body. */ }
    }
    // Prefer the cookie after migration. Accept a body token only for an old session's first refresh.
    const cookieToken = request.cookies.get(RT_COOKIE)?.value;
    const legacyToken = typeof payload.refreshToken === "string" ? payload.refreshToken : undefined;
    // Old tabs may still send their bearer token during rollout. Cookie-based refresh needs the guard.
    if (action === "refresh-token" && (cookieToken || !legacyToken) &&
        request.headers.get("x-athome-refresh") !== "1") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = cookieToken || legacyToken;
    if (!token) {
      const response = action === "logout"
        ? new NextResponse(null, { status: 204 })
        : NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      clearRefreshCookie(response);
      return response;
    }
    body = JSON.stringify({ ...payload, refreshToken: token });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: request.method,
      headers: {
        ...upstreamHeaders(request),
        Accept: request.headers.get("accept") ?? "application/json",
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        ...(request.headers.get("authorization") ? { Authorization: request.headers.get("authorization")! } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    const failed = NextResponse.json({ message: "Authentication service is temporarily unavailable" }, { status: 502 });
    if (action === "logout") clearRefreshCookie(failed);
    return failed;
  }
  const headers = {
    "Content-Type": response.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
    ...(response.headers.has("retry-after") ? { "Retry-After": response.headers.get("retry-after")! } : {}),
  };

  if (ISSUES_TOKENS.has(action) && headers["Content-Type"].includes("json")) {
    // Never expose refresh tokens in browser-readable JSON, including error responses.
    let json: Record<string, unknown>;
    try { json = await response.json(); } catch {
      return NextResponse.json({ message: "Invalid authentication response" }, { status: 502 });
    }
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      return NextResponse.json({ message: "Invalid authentication response" }, { status: 502 });
    }
    const { refreshToken, ...publicBody } = json;
    const result = NextResponse.json(publicBody, { status: response.status, headers });
    if (response.ok && typeof refreshToken === "string" && refreshToken) {
      result.cookies.set(RT_COOKIE, refreshToken, { ...COOKIE_OPTIONS, maxAge: RT_MAX_AGE });
    } else if (action === "refresh-token" && response.status === 401) {
      clearRefreshCookie(result);
    }
    return result;
  }

  const result = new NextResponse(response.status === 204 ? null : await response.arrayBuffer(), { status: response.status, headers });
  if ((action === "refresh-token" && response.status === 401) || action === "logout") clearRefreshCookie(result);
  return result;
}

export async function GET(request: NextRequest, context: RouteContext) { return proxyAuthRequest(request, context); }
export async function POST(request: NextRequest, context: RouteContext) { return proxyAuthRequest(request, context); }
export async function PUT(request: NextRequest, context: RouteContext) { return proxyAuthRequest(request, context); }
export async function DELETE(request: NextRequest, context: RouteContext) { return proxyAuthRequest(request, context); }
