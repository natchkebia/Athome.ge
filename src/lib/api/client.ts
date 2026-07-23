const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type ApiRequestOptions = RequestInit & {
  query?: Record<
    string,
    string | number | boolean | (string | number)[] | undefined | null
  >;
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
    // RFC7807 problem+json — `detail` არის კონკრეტული ტექსტი (მაგ. OUT_OF_STOCK-ის
    // ქართული აღწერა), `title` კი ზოგადი ("Conflict"). ამიტომ detail პრიორიტეტულია.
    const message = record.message ?? record.detail ?? record.title;

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
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  { query, headers, useProxy, token, body, ...options }: ApiRequestOptions = {}
): Promise<T> {
  const requestUrl = buildUrl(path, query, useProxy);
  // eslint-disable-next-line no-console
  console.log("[API REQUEST →]", options.method ?? "GET", requestUrl);
  const response = await fetch(requestUrl, {
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
