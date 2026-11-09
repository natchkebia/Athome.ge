import { isIP } from "node:net";
import type { NextRequest } from "next/server";

// Server-only runtime setting. Public asset URLs and browser requests keep their public origin.
export const UPSTREAM_API_URL = (
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
)?.replace(/\/$/, "");

function isLoopbackUpstream() {
  if (!process.env.INTERNAL_API_URL || !UPSTREAM_API_URL) return false;
  const { hostname } = new URL(UPSTREAM_API_URL);
  return hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "localhost";
}

export function clientIpOf(request: NextRequest): string | undefined {
  // Production must restrict the public origin to Cloudflare, which overwrites this header.
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf && isIP(cf)) return cf;
  const last = request.headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  return last && isIP(last) ? last : undefined;
}

export function upstreamHeaders(request: NextRequest): Record<string, string> {
  // The backend trusts forwarded IPs only on its loopback listener.
  if (!isLoopbackUpstream()) return {};
  const ip = clientIpOf(request);
  return ip ? { "X-Forwarded-For": ip, "X-Forwarded-Proto": "https" } : {};
}
