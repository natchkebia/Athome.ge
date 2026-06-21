import { ApiError, apiRequest } from "./client";
import { refreshToken } from "./auth";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

/**
 * Performs an authorized request through the Next.js proxy, attaching the stored
 * access token. On a 401 it transparently refreshes the token once and retries.
 */
export async function authorizedRequest<T>(
  path: string,
  options: Omit<Parameters<typeof apiRequest<T>>[1], "token" | "useProxy"> = {}
) {
  const tokens = getStoredAuthTokens();

  if (!tokens) {
    throw new ApiError(401, { message: "Unauthorized" });
  }

  try {
    return await apiRequest<T>(path, {
      ...options,
      token: tokens.accessToken,
      useProxy: true,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    try {
      await refreshToken(tokens.refreshToken);
    } catch {
      throw error;
    }

    const freshTokens = getStoredAuthTokens();

    if (!freshTokens) {
      throw error;
    }

    return apiRequest<T>(path, {
      ...options,
      token: freshTokens.accessToken,
      useProxy: true,
    });
  }
}
