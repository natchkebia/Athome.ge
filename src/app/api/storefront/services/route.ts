import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function GET(_request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const url = new URL("/api/storefront/services", API_BASE_URL);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: `Storefront services request failed: ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
