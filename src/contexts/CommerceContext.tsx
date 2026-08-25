"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import {
  getConfiguratorSlotProducts,
  type ConfiguratorSlot,
} from "@/lib/api/configurator";
import {
  addGuestCartItem,
  cacheProductInfo,
  clearGuestCart,
  clearGuestWishlist,
  getCachedInfo,
  getGuestCart,
  getGuestWishlist,
  removeGuestCartItem,
  toggleGuestWishlistItem,
  updateGuestCartItem,
} from "@/lib/commerce/guestStore";

type CommerceContextValue = {
  cart: ProfileCart;
  wishlist: ProfileWishlist;
  loading: boolean;
  cartProductIds: Set<number>;
  wishlistProductIds: Set<number>;
  refreshCommerce: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (productId: number, quantity?: number, swaps?: { componentProductId: number }[]) => Promise<void>;
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

// backend ზოგ mutation-ზე (POST/DELETE) ცარიელ პასუხს აბრუნებს — 204 ან ცარიელი
// body. ასეთ დროს პასუხი undefined-ია და მისით state-ის ჩანაცვლება კალათას/სურვილებს
// წაშლიდა. ჯერ ვამოწმებთ ნამდვილ ობიექტს; თუ ცარიელია — თავიდან ჩამოვტვირთავთ.
function isProfileCart(value: unknown): value is ProfileCart {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as ProfileCart).items)
  );
}

function isProfileWishlist(value: unknown): value is ProfileWishlist {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as ProfileWishlist).items)
  );
}

// Configurator/cart mutations can briefly return cart rows without presentation
// fields. Keep the backend quantities authoritative, but fill the visible data
// from the product cache so the badge and the rendered list never disagree.
function hydrateCart(cart: ProfileCart): ProfileCart {
  return {
    ...cart,
    items: cart.items.map((item) => {
      const cached = getCachedInfo(item.productId);
      if (!cached) return item;

      const sellingPrice = item.sellingPrice || cached.sellingPrice;
      return {
        ...item,
        productName: item.productName || cached.productName,
        imageUrl: item.imageUrl || cached.imageUrl,
        slug: item.slug || cached.slug,
        sellingPrice,
        oldPrice: item.oldPrice ?? cached.oldPrice,
        lineTotal: item.lineTotal || sellingPrice * item.quantity,
        isInStock: item.isInStock ?? cached.isInStock ?? true,
      };
    }),
  };
}

const CONFIGURATOR_SLOTS: ConfiguratorSlot[] = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "psu",
  "case",
  "cpuCooler",
  "liquidCooler",
  "storageDrive",
  "storageSsd",
  "storageHdd",
  "caseFan",
];

async function hydrateConfiguratorCart(cart: ProfileCart): Promise<ProfileCart> {
  let hydrated = hydrateCart(cart);
  const missingIds = new Set(
    hydrated.items
      .filter((item) => !item.productName || !item.imageUrl || !item.sellingPrice)
      .map((item) => item.productId)
  );

  if (missingIds.size === 0) return hydrated;

  const results = await Promise.allSettled(
    CONFIGURATOR_SLOTS.map((slot) =>
      getConfiguratorSlotProducts(slot, { pageSize: 1000 })
    )
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const product of result.value.items) {
      if (!missingIds.has(product.id)) continue;
      cacheProductInfo({
        productId: product.id,
        productName: product.name || `პროდუქტი #${product.id}`,
        imageUrl: product.thumbnailUrl || "",
        slug: product.slug || "",
        sellingPrice: product.effectivePrice,
        oldPrice: product.oldPrice ?? undefined,
        isInStock: !String(product.stockStatus ?? "").toLowerCase().includes("out"),
      });
      missingIds.delete(product.id);
    }
  }

  hydrated = hydrateCart(hydrated);
  return hydrated;
}

// optimistic item — ბარათი add-ისას პროდუქტის ინფოს ქეშავს (getCachedInfo),
// ასე რომ სახელი/ფასი/ფოტო მაშინვე გვაქვს და dropdown-ში ცარიელი რიგი აღარ ჩანს.
function optimisticCartItem(productId: number, quantity: number) {
  const info = getCachedInfo(productId);
  const price = info?.sellingPrice ?? 0;
  return {
    id: productId,
    productId,
    productName: info?.productName ?? "",
    productSku: "",
    imageUrl: info?.imageUrl ?? "",
    slug: info?.slug ?? "",
    sellingPrice: price,
    oldPrice: info?.oldPrice,
    quantity,
    lineTotal: price * quantity,
    isInStock: info?.isInStock ?? true,
  };
}

function optimisticWishlistItem(productId: number) {
  const info = getCachedInfo(productId);
  return {
    id: productId,
    productId,
    productName: info?.productName ?? "",
    productSku: "",
    imageUrl: info?.imageUrl ?? "",
    slug: info?.slug ?? "",
    sellingPrice: info?.sellingPrice ?? 0,
    oldPrice: info?.oldPrice,
    isInCart: false,
    isInStock: info?.isInStock ?? true,
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
  const cartRef = useRef<ProfileCart>(emptyCart);
  const cartMutationQueueRef = useRef(new Map<number, Promise<void>>());
  const [wishlist, setWishlist] = useState<ProfileWishlist>(emptyWishlist);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const refreshCommerce = useCallback(async () => {
    const tokens = getStoredAuthTokens();

    if (!tokens?.accessToken) {
      // სტუმარი — კალათა/სურვილები localStorage-დან.
      setCart(getGuestCart());
      setWishlist(getGuestWishlist());
      return;
    }

    setLoading(true);

    try {
      const [cartResponse, wishlistResponse] = await Promise.all([
        getProfileCart(),
        getProfileWishlist(),
      ]);

      setCart(cartResponse ? await hydrateConfiguratorCart(cartResponse) : emptyCart);
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
      setCart(getGuestCart());
      return;
    }

    try {
      const cartResponse = await getProfileCart();
      setCart(cartResponse ? await hydrateConfiguratorCart(cartResponse) : emptyCart);
    } catch {
      setCart(emptyCart);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!hasAccessToken()) {
      setWishlist(getGuestWishlist());
      return;
    }

    try {
      const wishlistResponse = await getProfileWishlist();
      setWishlist(wishlistResponse ?? emptyWishlist);
    } catch {
      setWishlist(emptyWishlist);
    }
  }, []);

  // ავტორიზაციისას სტუმრის localStorage კალათა/სურვილები ანგარიშში ჩაიერთვება.
  const syncOnAuthChange = useCallback(async () => {
    if (hasAccessToken()) {
      const guestCart = getGuestCart();
      const guestWishlist = getGuestWishlist();

      if (guestCart.items.length > 0 || guestWishlist.items.length > 0) {
        try {
          for (const item of guestCart.items) {
            await addProfileCartItem(item.productId, item.quantity);
          }
          for (const item of guestWishlist.items) {
            await addProfileWishlistItem(item.productId);
          }
        } catch {
          // merge ვერ მოხერხდა — ანგარიშის მონაცემებს მაინც ჩავტვირთავთ.
        }
        clearGuestCart();
        clearGuestWishlist();
      }
    }

    await refreshCommerce();
  }, [refreshCommerce]);

  useEffect(() => {
    syncOnAuthChange();

    window.addEventListener("athome-auth-changed", syncOnAuthChange);

    return () => {
      window.removeEventListener("athome-auth-changed", syncOnAuthChange);
    };
  }, [syncOnAuthChange]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, swaps?: { componentProductId: number }[]) => {
      // სტუმარი — localStorage კალათა (დარეგისტრირება არ სჭირდება).
      if (!hasAccessToken()) {
        const nextCart = addGuestCartItem(productId, quantity);
        cartRef.current = nextCart;
        setCart(nextCart);
        return;
      }

      const currentCart = cartRef.current;
      const existingItem = currentCart.items.find(
        (item) => item.productId === productId
      );
      const targetQuantity = (existingItem?.quantity ?? 0) + quantity;

      const items = existingItem
        ? currentCart.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: targetQuantity,
                  lineTotal: item.sellingPrice * targetQuantity,
                }
              : item
          )
        : [optimisticCartItem(productId, quantity), ...currentCart.items];

      const optimisticCart = {
        ...currentCart,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce((sum, item) => sum + item.lineTotal, 0),
      };
      cartRef.current = optimisticCart;
      setCart(optimisticCart);

      const previousMutation =
        cartMutationQueueRef.current.get(productId) ?? Promise.resolve();
      const mutation = previousMutation
        .catch(() => undefined)
        .then(async () => {
          // POST creates a row; PUT changes the absolute quantity of an
          // existing row. Serializing per product also prevents rapid clicks
          // from letting an older response overwrite a newer quantity.
          const updatedCart = swaps?.length
            ? await addProfileCartItem(productId, quantity, swaps)
            : existingItem
              ? await updateProfileCartItem(productId, targetQuantity)
              : await addProfileCartItem(productId, quantity);
          if (isProfileCart(updatedCart)) {
            const hydratedCart = await hydrateConfiguratorCart(updatedCart);
            cartRef.current = hydratedCart;
            setCart(hydratedCart);
          } else {
            await refreshCart();
          }
        });

      cartMutationQueueRef.current.set(productId, mutation);
      try {
        await mutation;
      } catch {
        await refreshCart();
      } finally {
        if (cartMutationQueueRef.current.get(productId) === mutation) {
          cartMutationQueueRef.current.delete(productId);
        }
      }
    },
    [refreshCart]
  );

  const updateCartQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!hasAccessToken()) {
        setCart(updateGuestCartItem(productId, quantity));
        return;
      }

      try {
        const updatedCart =
          quantity <= 0
            ? await removeProfileCartItem(productId)
            : await updateProfileCartItem(productId, quantity);
        if (isProfileCart(updatedCart)) setCart(updatedCart);
        else await refreshCart();
      } catch {
        await refreshCart();
      }
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(async (productId: number) => {
    if (!hasAccessToken()) {
      setCart(removeGuestCartItem(productId));
      return;
    }

    try {
      const updatedCart = await removeProfileCartItem(productId);
      if (isProfileCart(updatedCart)) setCart(updatedCart);
      else await refreshCart();
    } catch {
      await refreshCart();
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    if (!hasAccessToken()) {
      setCart(clearGuestCart());
      return;
    }

    try {
      await clearProfileCart();
      setCart(emptyCart);
    } catch {
      await refreshCart();
    }
  }, [refreshCart]);

  const toggleWishlist = useCallback(
    async (productId: number) => {
      // სტუმარი — localStorage სურვილების სია.
      if (!hasAccessToken()) {
        setWishlist(toggleGuestWishlistItem(productId));
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

        if (isProfileWishlist(updatedWishlist)) setWishlist(updatedWishlist);
        else await refreshWishlist();
      } catch {
        await refreshWishlist();
      }
    },
    [refreshWishlist, wishlist.items]
  );

  const clearWishlist = useCallback(async () => {
    if (!hasAccessToken()) {
      setWishlist(clearGuestWishlist());
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
    // სტუმარი — სურვილების ნივთები localStorage კალათაში.
    if (!hasAccessToken()) {
      let nextCart = getGuestCart();
      wishlist.items.forEach((item) => {
        nextCart = addGuestCartItem(item.productId, 1);
      });
      setCart(nextCart);
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
