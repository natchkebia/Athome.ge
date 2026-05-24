const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type ApiRequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
  useProxy?: boolean;
};

function buildUrl(
  path: string,
  query?: ApiRequestOptions["query"],
  useProxy?: boolean
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = useProxy ? undefined : API_BASE_URL;
  const url = new URL(
    `${baseUrl ?? ""}${normalizedPath}`,
    baseUrl ?? window.location.origin
  );

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  { query, headers, useProxy, ...options }: ApiRequestOptions = {}
): Promise<T> {
  const response = await fetch(buildUrl(path, query, useProxy), {
    ...options,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
