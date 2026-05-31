const ACCESS_TOKEN_KEY = "athome.accessToken";
const REFRESH_TOKEN_KEY = "athome.refreshToken";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "athome.accessTokenExpiresAt";

export type StoredAuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
};

export function getStoredAuthTokens(): StoredAuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt:
      localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY) ?? undefined,
  };
}

export function storeAuthTokens(tokens: StoredAuthTokens) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

  if (tokens.accessTokenExpiresAt) {
    localStorage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      tokens.accessTokenExpiresAt
    );
  } else {
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  }

  window.dispatchEvent(new Event("athome-auth-changed"));
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  window.dispatchEvent(new Event("athome-auth-changed"));
}

function getJwtExpiry(accessToken: string) {
  const [, payload] = accessToken.split(".");

  if (!payload) return null;

  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };

    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function shouldRefreshAccessToken(bufferMs = 60_000) {
  const tokens = getStoredAuthTokens();

  if (!tokens) return false;

  const explicitExpiry = tokens.accessTokenExpiresAt
    ? new Date(tokens.accessTokenExpiresAt).getTime()
    : null;
  const expiry = explicitExpiry || getJwtExpiry(tokens.accessToken);

  if (!expiry || Number.isNaN(expiry)) return false;

  return expiry - Date.now() <= bufferMs;
}
