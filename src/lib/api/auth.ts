import { ApiError, apiRequest } from "./client";
import {
  clearAuthTokens,
  getStoredAuthTokens,
  storeAuthTokens,
} from "../auth/tokens";
import { storeProfileGender, storeProfileAvatar } from "../auth/profilePreferences";

export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: string;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
};

export type AuthTokensResponse = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  expiresAt?: string;
  user?: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type IndividualRegisterPayload = {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type LegalRegisterPayload = {
  companyName?: string;
  identificationCode: string;
  representativeName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type SocialAuthPayload = {
  token: string;
  provider: "google" | "facebook";
  acceptedTerms: boolean;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
};

export type ForgotPasswordResponse = {
  emailSent: boolean;
  userFound: boolean;
  message: string;
  debugResetToken?: string;
  smtpError?: string;
};

function jsonBody(payload: unknown) {
  return JSON.stringify(payload);
}

function persistAuthResponse(response: AuthTokensResponse) {
  if (response.accessToken && response.refreshToken) {
    storeAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: response.accessTokenExpiresAt ?? response.expiresAt,
    });
  }

  if (response.user?.gender) {
    storeProfileGender(
      response.user.gender.toLowerCase() === "female" ? "female" : "male"
    );
  }

  return response;
}

async function authorizedRequest<T>(
  path: string,
  options: Omit<Parameters<typeof apiRequest<T>>[1], "token"> = {}
) {
  const tokens = getStoredAuthTokens();

  if (!tokens) {
    throw new Error("Unauthorized");
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
      clearAuthTokens();
      throw error;
    }

    const freshTokens = getStoredAuthTokens();

    if (!freshTokens) {
      clearAuthTokens();
      throw error;
    }

    try {
      return await apiRequest<T>(path, {
        ...options,
        token: freshTokens.accessToken,
        useProxy: true,
      });
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        clearAuthTokens();
      }

      throw retryError;
    }
  }
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<AuthTokensResponse>("/api/auth/login", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });

  return persistAuthResponse(response);
}

export async function socialLogin(payload: SocialAuthPayload) {
  const response = await apiRequest<AuthTokensResponse>("/api/auth/social", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });

  return persistAuthResponse(response);
}

export function registerIndividual(payload: IndividualRegisterPayload) {
  return apiRequest<RegisterResponse>("/api/auth/register/individual", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export function registerLegal(payload: LegalRegisterPayload) {
  return apiRequest<RegisterResponse>("/api/auth/register/legal", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export async function refreshToken(refreshToken: string) {
  const response = await apiRequest<AuthTokensResponse>(
    "/api/auth/refresh-token",
    {
      method: "POST",
      body: jsonBody({ refreshToken }),
      useProxy: true,
    }
  );

  return persistAuthResponse(response);
}

export async function getCurrentUser() {
  const tokens = getStoredAuthTokens();

  if (!tokens) {
    return null;
  }

  return authorizedRequest<AuthUser>("/api/auth/me");
}

export async function updateProfile(payload: {
  firstName: string;
  lastName: string;
  phone: string;
}) {
  return authorizedRequest<AuthUser>("/api/auth/profile", {
    method: "PUT",
    body: jsonBody(payload),
  });
}

export async function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  // FormData body — apiRequest არ აყენებს application/json-ს, ბრაუზერი თვითონ
  // ჩასვამს multipart/form-data-ს boundary-ით.
  return authorizedRequest<AuthUser>("/api/auth/profile/avatar", {
    method: "POST",
    body: formData,
  });
}

export async function deleteProfileAvatar() {
  return authorizedRequest<AuthUser>("/api/auth/profile/avatar", {
    method: "DELETE",
  });
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return authorizedRequest<void>("/api/auth/change-password", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export async function forgotPassword(payload: {
  email?: string;
  phone?: string;
}) {
  return apiRequest<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: jsonBody({ email: payload.email ?? "", phone: payload.phone ?? "" }),
    useProxy: true,
  });
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  newPassword: string;
}) {
  return apiRequest<void>("/api/auth/reset-password", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export async function resetPasswordSms(payload: {
  phone: string;
  otpCode: string;
  newPassword: string;
}) {
  return apiRequest<void>("/api/auth/reset-password/sms", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export async function resetPasswordEmailOtp(payload: {
  email: string;
  otpCode: string;
  newPassword: string;
}) {
  return apiRequest<void>("/api/auth/reset-password/email-otp", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export async function verifyEmailLink(payload: { email: string; token: string }) {
  return apiRequest<void>("/api/auth/verify-email/link", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export async function verifyEmailCode(payload: {
  email: string;
  otpCode: string;
}) {
  return apiRequest<void>("/api/auth/verify-email/code", {
    method: "POST",
    body: jsonBody(payload),
    useProxy: true,
  });
}

export async function resendEmailVerification(email: string) {
  return apiRequest<void>("/api/auth/verify-email/resend", {
    method: "POST",
    body: jsonBody({ email }),
    useProxy: true,
  });
}

export async function logout() {
  const tokens = getStoredAuthTokens();

  if (!tokens) {
    clearAuthTokens();
    storeProfileAvatar(null);
    return;
  }

  try {
    await apiRequest<void>("/api/auth/logout", {
      method: "POST",
      token: tokens.accessToken,
      body: jsonBody({ refreshToken: tokens.refreshToken }),
      useProxy: true,
    });
  } finally {
    clearAuthTokens();
    storeProfileAvatar(null);
  }
}
