import { authorizedRequest as authorizedProfileRequest } from "./authorized";

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
  isConfigured?: boolean;
  configuredParts?: { productId: number; name: string; quantity: number }[];
  configurationJson?: string;
  swaps?: { componentProductId: number }[];
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

export function getProfileCart() {
  return authorizedProfileRequest<ProfileCart>("/api/profile/cart");
}

export function clearProfileCart() {
  return authorizedProfileRequest<void>("/api/profile/cart", {
    method: "DELETE",
  });
}

export function addProfileCartItem(
  productId: number,
  quantity = 1,
  swaps?: { componentProductId: number }[],
) {
  return authorizedProfileRequest<ProfileCart>("/api/profile/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity, ...(swaps?.length ? { swaps } : {}) }),
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
