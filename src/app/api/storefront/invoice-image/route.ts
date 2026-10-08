import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path?.startsWith("/uploads/products/images/") || path.includes("..") || path.includes("\\")) {
    return new Response(null, { status: 400 });
  }

  try {
    const source = new URL(path, "https://api.ithome.ge");
    if (source.origin !== "https://api.ithome.ge" || !source.pathname.startsWith("/uploads/products/images/")) {
      return new Response(null, { status: 400 });
    }
    const response = await fetch(source, { signal: AbortSignal.timeout(5000) });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(png|jpeg|webp|avif)/i.test(contentType)) {
      return new Response(null, { status: 404 });
    }
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 5_000_000) return new Response(null, { status: 413 });
    return new Response(bytes, {
      headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
