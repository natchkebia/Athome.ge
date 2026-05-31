import { ApiError, apiRequest } from "./client";
import { refreshToken } from "./auth";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

export type ProfileCartItem = {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  imageUrl?: string;
  slug?: string;
  sellingPrice: number;
  oldPrice?: number;
  quantity: number;
  lineTotal: number;
  isInStock: boolean;
};

export type ProfileCart = {
  items: ProfileCartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
};

export type ProfileWishlistItem = {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  imageUrl?: string;
  slug?: string;
  sellingPrice: number;
  oldPrice?: number;
  isInCart: boolean;
  isInStock: boolean;
  addedAt?: string;
};

export type ProfileWishlist = {
  items: ProfileWishlistItem[];
  totalItems: number;
};

async function authorizedProfileRequest<T>(
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

export function getProfileCart() {
  return authorizedProfileRequest<ProfileCart>("/api/profile/cart");
}

export function clearProfileCart() {
  return authorizedProfileRequest<void>("/api/profile/cart", {
    method: "DELETE",
  });
}

export function addProfileCartItem(productId: number, quantity = 1) {
  return authorizedProfileRequest<ProfileCart>("/api/profile/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateProfileCartItem(productId: number, quantity: number) {
  return authorizedProfileRequest<ProfileCart>(
    `/api/profile/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }
  );
}

export function removeProfileCartItem(productId: number) {
  return authorizedProfileRequest<ProfileCart>(
    `/api/profile/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    }
  );
}

export function getProfileWishlist() {
  return authorizedProfileRequest<ProfileWishlist>("/api/profile/wishlist");
}

export function addProfileWishlistItem(productId: number) {
  return authorizedProfileRequest<ProfileWishlist>(
    `/api/profile/wishlist/${encodeURIComponent(productId)}`,
    {
      method: "POST",
    }
  );
}

export function removeProfileWishlistItem(productId: number) {
  return authorizedProfileRequest<ProfileWishlist>(
    `/api/profile/wishlist/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    }
  );
}

export function checkProfileWishlistItem(productId: number) {
  return authorizedProfileRequest<boolean | string>(
    `/api/profile/wishlist/${encodeURIComponent(productId)}/check`,
  );
}
