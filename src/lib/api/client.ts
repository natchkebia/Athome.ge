const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type ApiRequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
  useProxy?: boolean;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, details: unknown) {
    super(getApiErrorMessage(status, details));
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getApiErrorMessage(status: number, details: unknown) {
  if (details && typeof details === "object") {
    const record = details as Record<string, unknown>;
    const message = record.message ?? record.title ?? record.detail;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (status === 401) {
    return "სესია ამოიწურა. გთხოვთ თავიდან გაიაროთ ავტორიზაცია.";
  }

  return `API request failed: ${status}`;
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text.trim()) {
    return undefined;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

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
  { query, headers, useProxy, token, body, ...options }: ApiRequestOptions = {}
): Promise<T> {
  const response = await fetch(buildUrl(path, query, useProxy), {
    ...options,
    body,
    headers: {
      Accept: "application/json",
      ...(body && typeof body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
