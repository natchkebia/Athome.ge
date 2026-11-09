import { getBrowserLocale } from "@/lib/i18n/locale";

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
  code?: string;
  retryAfter?: number;

  constructor(status: number, details: unknown, retryAfter?: number) {
    super(getApiErrorMessage(status, details, retryAfter));
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.retryAfter = retryAfter;
    this.code = details && typeof details === "object"
      ? String((details as Record<string, unknown>).code ?? "") : undefined;
  }
}

export function parseRetryAfter(value: string | null) {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - Date.now()) / 1000)) : undefined;
}

function getApiErrorMessage(status: number, details: unknown, retryAfter?: number) {
  const en = getBrowserLocale() === "en";
  const code = details && typeof details === "object"
    ? (details as Record<string, unknown>).code : undefined;
  if (code === "WEAK_PASSWORD") return en
    ? "Use 12–128 characters, different from your email and phone."
    : "გამოიყენეთ 12–128 სიმბოლო, ელფოსტისა და ტელეფონისგან განსხვავებული.";
  if (code === "BREACHED_PASSWORD") return en
    ? "This password appeared in a data breach. Choose a different password."
    : "ეს პაროლი გაჟონილ მონაცემებში აღმოჩნდა. აირჩიეთ სხვა პაროლი.";
  if (code === "AI_DAILY_LIMIT") return en ? "Daily AI limit reached. Please return tomorrow." : "AI-ის დღიური ლიმიტი ამოიწურა. დაბრუნდით ხვალ.";
  if (status === 429) return retryAfter !== undefined
    ? (en ? `Too many attempts. Try again in ${retryAfter} seconds.` : `ძალიან ბევრი მოთხოვნა. გაიმეორეთ ${retryAfter} წამში.`)
    : (en ? "Too many attempts. Please try again later." : "ძალიან ბევრი მოთხოვნა. გაიმეორეთ მოგვიანებით.");
  if (code === "AI_PROMPT_REQUIRED") return en ? "Enter a message." : "შეიყვანეთ შეტყობინება.";
  if (code === "AI_PROMPT_TOO_LONG") return en ? "Use at most 2000 characters." : "გამოიყენეთ მაქსიმუმ 2000 სიმბოლო.";
  if (code === "AI_UNAVAILABLE") return en ? "AI is temporarily unavailable." : "AI დროებით მიუწვდომელია.";
  if (details && typeof details === "object") {
    const record = details as Record<string, unknown>;
    // RFC7807 problem+json — `detail` არის კონკრეტული ტექსტი (მაგ. OUT_OF_STOCK-ის
    // ქართული აღწერა), `title` კი ზოგადი ("Conflict"). ამიტომ detail პრიორიტეტულია.
    const message = record.message ?? record.detail ?? record.title;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (typeof details === "string" && details.trim()) return details;

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

  if ((contentType.includes("application/json") || contentType.includes("+json"))) {
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
  const isLanguageAware =
    path.startsWith("/api/storefront/") || path.startsWith("/api/profile/");
  const locale = isLanguageAware ? getBrowserLocale() : undefined;
  const requestUrl = buildUrl(
    path,
    locale ? { ...query, lang: locale } : query,
    useProxy
  );
  const response = await fetch(requestUrl, {
    ...options,
    body,
    headers: {
      Accept: "application/json",
      ...(body && typeof body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(locale ? { "X-Lang": locale } : {}),
      ...headers,
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    // Login failures deliberately use identical copy for unknown, wrong and locked accounts.
    if (path === "/api/auth/login" && response.status === 401) {
      throw new ApiError(401, { message: getBrowserLocale() === "en"
        ? "Email or password is incorrect." : "ელფოსტა ან პაროლი არასწორია." });
    }
    throw new ApiError(response.status, data, parseRetryAfter(response.headers.get("retry-after")));
  }

  return data as T;
}
