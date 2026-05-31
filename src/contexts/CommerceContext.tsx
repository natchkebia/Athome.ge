"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addProfileCartItem,
  addProfileWishlistItem,
  clearProfileCart,
  getProfileCart,
  getProfileWishlist,
  ProfileCart,
  ProfileWishlist,
  removeProfileCartItem,
  removeProfileWishlistItem,
  updateProfileCartItem,
} from "@/lib/api/profileCommerce";
import { getStoredAuthTokens } from "@/lib/auth/tokens";

type CommerceContextValue = {
  cart: ProfileCart;
  wishlist: ProfileWishlist;
  loading: boolean;
  cartProductIds: Set<number>;
  wishlistProductIds: Set<number>;
  refreshCommerce: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  addWishlistToCart: () => Promise<void>;
};

const emptyCart: ProfileCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  currency: "₾",
};

const emptyWishlist: ProfileWishlist = {
  items: [],
  totalItems: 0,
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

function hasAccessToken() {
  return Boolean(getStoredAuthTokens()?.accessToken);
}

function redirectToAuthorization() {
  if (typeof window !== "undefined") {
    window.location.href = "/authorization";
  }
}

function optimisticCartItem(productId: number, quantity: number) {
  return {
    id: productId,
    productId,
    productName: "",
    productSku: "",
    imageUrl: "",
    slug: "",
    sellingPrice: 0,
    oldPrice: undefined,
    quantity,
    lineTotal: 0,
    isInStock: true,
  };
}

function optimisticWishlistItem(productId: number) {
  return {
    id: productId,
    productId,
    productName: "",
    productSku: "",
    imageUrl: "",
    slug: "",
    sellingPrice: 0,
    oldPrice: undefined,
    isInCart: false,
    isInStock: true,
  };
}

function cartItemFromWishlistItem(item: ProfileWishlist["items"][number]) {
  return {
    id: item.productId,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    imageUrl: item.imageUrl,
    slug: item.slug,
    sellingPrice: item.sellingPrice,
    oldPrice: item.oldPrice,
    quantity: 1,
    lineTotal: item.sellingPrice,
    isInStock: item.isInStock,
  };
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ProfileCart>(emptyCart);
  const [wishlist, setWishlist] = useState<ProfileWishlist>(emptyWishlist);
  const [loading, setLoading] = useState(false);

  const refreshCommerce = useCallback(async () => {
    const tokens = getStoredAuthTokens();

    if (!tokens?.accessToken) {
      setCart(emptyCart);
      setWishlist(emptyWishlist);
      return;
    }

    setLoading(true);

    try {
      const [cartResponse, wishlistResponse] = await Promise.all([
        getProfileCart(),
        getProfileWishlist(),
      ]);

      setCart(cartResponse ?? emptyCart);
      setWishlist(wishlistResponse ?? emptyWishlist);
    } catch {
      setCart(emptyCart);
      setWishlist(emptyWishlist);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!hasAccessToken()) {
      setCart(emptyCart);
      return;
    }

    try {
      const cartResponse = await getProfileCart();
      setCart(cartResponse ?? emptyCart);
    } catch {
      setCart(emptyCart);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!hasAccessToken()) {
      setWishlist(emptyWishlist);
      return;
    }

    try {
      const wishlistResponse = await getProfileWishlist();
      setWishlist(wishlistResponse ?? emptyWishlist);
    } catch {
      setWishlist(emptyWishlist);
    }
  }, []);

  useEffect(() => {
    refreshCommerce();

    window.addEventListener("athome-auth-changed", refreshCommerce);

    return () => {
      window.removeEventListener("athome-auth-changed", refreshCommerce);
    };
  }, [refreshCommerce]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!hasAccessToken()) {
        redirectToAuthorization();
        return;
      }

      setCart((currentCart) => {
        const existingItem = currentCart.items.find(
          (item) => item.productId === productId
        );

        const items = existingItem
          ? currentCart.items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [optimisticCartItem(productId, quantity), ...currentCart.items];

        return {
          ...currentCart,
          items,
          totalItems: currentCart.totalItems + quantity,
        };
      });

      try {
        const updatedCart = await addProfileCartItem(productId, quantity);
        setCart(updatedCart ?? emptyCart);
      } catch {
        await refreshCart();
      }
    },
    [refreshCart]
  );

  const updateCartQuantity = useCallback(
    async (productId: number, quantity: number) => {
      try {
        const updatedCart =
          quantity <= 0
            ? await removeProfileCartItem(productId)
            : await updateProfileCartItem(productId, quantity);
        setCart(updatedCart ?? emptyCart);
      } catch {
        await refreshCart();
      }
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(async (productId: number) => {
    try {
      const updatedCart = await removeProfileCartItem(productId);
      setCart(updatedCart ?? emptyCart);
    } catch {
      await refreshCart();
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    try {
      await clearProfileCart();
      setCart(emptyCart);
    } catch {
      await refreshCart();
    }
  }, [refreshCart]);

  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (!hasAccessToken()) {
        redirectToAuthorization();
        return;
      }

      const isWishlisted = wishlist.items.some(
        (item) => item.productId === productId
      );

      setWishlist((currentWishlist) => ({
        ...currentWishlist,
        items: isWishlisted
          ? currentWishlist.items.filter((item) => item.productId !== productId)
          : [optimisticWishlistItem(productId), ...currentWishlist.items],
        totalItems: Math.max(
          currentWishlist.totalItems + (isWishlisted ? -1 : 1),
          0
        ),
      }));

      try {
        const updatedWishlist = isWishlisted
          ? await removeProfileWishlistItem(productId)
          : await addProfileWishlistItem(productId);

        setWishlist(updatedWishlist ?? emptyWishlist);
      } catch {
        await refreshWishlist();
      }
    },
    [refreshWishlist, wishlist.items]
  );

  const clearWishlist = useCallback(async () => {
    if (!hasAccessToken()) {
      redirectToAuthorization();
      return;
    }

    try {
      await Promise.all(
        wishlist.items.map((item) => removeProfileWishlistItem(item.productId))
      );
    } finally {
      await refreshWishlist();
    }
  }, [refreshWishlist, wishlist.items]);

  const addWishlistToCart = useCallback(async () => {
    if (!hasAccessToken()) {
      redirectToAuthorization();
      return;
    }

    const productIds = wishlist.items.map((item) => item.productId);

    setCart((currentCart) => {
      const cartItems = [...currentCart.items];
      let addedQuantity = 0;

      wishlist.items.forEach((wishlistItem) => {
        const existingIndex = cartItems.findIndex(
          (cartItem) => cartItem.productId === wishlistItem.productId
        );

        addedQuantity += 1;

        if (existingIndex >= 0) {
          cartItems[existingIndex] = {
            ...cartItems[existingIndex],
            quantity: cartItems[existingIndex].quantity + 1,
            lineTotal:
              cartItems[existingIndex].sellingPrice *
              (cartItems[existingIndex].quantity + 1),
          };
        } else {
          cartItems.unshift(cartItemFromWishlistItem(wishlistItem));
        }
      });

      return {
        ...currentCart,
        items: cartItems,
        totalItems: currentCart.totalItems + addedQuantity,
        totalPrice: cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
      };
    });

    let updatedCart: ProfileCart | null = null;

    try {
      for (const productId of productIds) {
        updatedCart = await addProfileCartItem(productId, 1);
      }

      setCart(updatedCart ?? cart);
    } finally {
      await refreshCart();
    }
  }, [cart, refreshCart, wishlist.items]);

  const cartProductIds = useMemo(
    () => new Set(cart.items.map((item) => item.productId)),
    [cart.items]
  );
  const wishlistProductIds = useMemo(
    () => new Set(wishlist.items.map((item) => item.productId)),
    [wishlist.items]
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      loading,
      cartProductIds,
      wishlistProductIds,
      refreshCommerce,
      refreshCart,
      refreshWishlist,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      clearWishlist,
      addWishlistToCart,
    }),
    [
      addToCart,
      addWishlistToCart,
      cart,
      cartProductIds,
      clearCart,
      clearWishlist,
      loading,
      refreshCart,
      refreshCommerce,
      refreshWishlist,
      removeFromCart,
      toggleWishlist,
      updateCartQuantity,
      wishlist,
      wishlistProductIds,
    ]
  );

  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used inside CommerceProvider");
  }

  return context;
}
