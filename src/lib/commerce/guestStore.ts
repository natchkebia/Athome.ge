// სტუმრის (არა-ავტორიზებული) კალათა და სურვილების სია — localStorage-ში.
// დარეგისტრირების იძულების გარეშე: სტუმარს შეუძლია დაამატოს, წაშალოს, იყიდოს.
import type {
  ProfileCart,
  ProfileCartItem,
  ProfileWishlist,
  ProfileWishlistItem,
} from "@/lib/api/profileCommerce";

const CART_KEY = "athome.guestCart";
const WISHLIST_KEY = "athome.guestWishlist";
const INFO_KEY = "athome.productInfo";

// პროდუქტის ჩვენების ინფო, რომელსაც ბარათი/დეტალი add-ისას ქეშავს, რომ
// სტუმრის კალათამ სახელი/ფოტო/ფასი იცოდეს (backend by-id აქ არ გვაქვს).
export type GuestProductInfo = {
  productId: number;
  productName: string;
  imageUrl?: string;
  slug?: string;
  sellingPrice: number;
  oldPrice?: number;
  isInStock?: boolean;
  availableQuantity?: number;
};

const emptyCart: ProfileCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  currency: "₾",
};

const emptyWishlist: ProfileWishlist = { items: [], totalItems: 0 };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage მიუწვდომელია (private mode) — სესიის ფარგლებში მაინც იმუშავებს.
  }
}

// ---- product-info cache ----

export function cacheProductInfo(info: GuestProductInfo) {
  if (!info.productId) return;
  const map = read<Record<number, GuestProductInfo>>(INFO_KEY, {});
  const existing = map[info.productId];
  map[info.productId] = {
    ...existing,
    ...info,
    imageUrl: info.imageUrl ?? existing?.imageUrl,
    slug: info.slug ?? existing?.slug,
    oldPrice: info.oldPrice ?? existing?.oldPrice,
    isInStock: info.isInStock ?? existing?.isInStock,
    availableQuantity: info.availableQuantity ?? existing?.availableQuantity,
  };
  write(INFO_KEY, map);
}

export function getCachedInfo(productId: number): GuestProductInfo | null {
  const map = read<Record<number, GuestProductInfo>>(INFO_KEY, {});
  return map[productId] ?? null;
}

// ---- totals ----

function recalcCart(items: ProfileCartItem[]): ProfileCart {
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.lineTotal, 0),
    currency: "₾",
  };
}

// ---- guest cart ----

export function getGuestCart(): ProfileCart {
  return read<ProfileCart>(CART_KEY, emptyCart);
}

export function addGuestCartItem(
  productId: number,
  quantity = 1,
  swaps?: { componentProductId: number }[],
): ProfileCart {
  const cart = getGuestCart();
  const info = getCachedInfo(productId);
  const existing = cart.items.find((item) => item.productId === productId);
  if (info?.isInStock === false || existing?.isInStock === false) return cart;
  if (
    info?.availableQuantity != null &&
    (existing?.quantity ?? 0) + quantity > info.availableQuantity
  ) return cart;
  const items = [...cart.items];
  const index = items.findIndex((item) => item.productId === productId);

  if (index >= 0) {
    const newQty = items[index].quantity + quantity;
    const price = info?.sellingPrice ?? items[index].sellingPrice;
    items[index] = {
      ...items[index],
      // ძველი, არასრულად შენახული ჩანაწერიც აღდგეს შემდეგ add-ზე.
      productName: info?.productName || items[index].productName,
      imageUrl: info?.imageUrl || items[index].imageUrl,
      slug: info?.slug || items[index].slug,
      sellingPrice: price,
      oldPrice: info?.oldPrice ?? items[index].oldPrice,
      isInStock: info?.isInStock ?? items[index].isInStock,
      availableQuantity: info?.availableQuantity ?? items[index].availableQuantity,
      swaps: swaps?.length ? swaps : items[index].swaps,
      isConfigured: swaps?.length ? true : items[index].isConfigured,
      quantity: newQty,
      lineTotal: price * newQty,
    };
  } else {
    const price = info?.sellingPrice ?? 0;
    items.unshift({
      id: productId,
      productId,
      productName: info?.productName ?? "",
      imageUrl: info?.imageUrl,
      slug: info?.slug,
      sellingPrice: price,
      oldPrice: info?.oldPrice,
      quantity,
      lineTotal: price * quantity,
      isInStock: info?.isInStock ?? true,
      availableQuantity: info?.availableQuantity,
      swaps: swaps?.length ? swaps : undefined,
      isConfigured: Boolean(swaps?.length),
    });
  }

  const next = recalcCart(items);
  write(CART_KEY, next);
  return next;
}

export function updateGuestCartItem(
  productId: number,
  quantity: number
): ProfileCart {
  const cart = getGuestCart();
  const currentItem = cart.items.find((item) => item.productId === productId);
  if (
    quantity > (currentItem?.availableQuantity ?? Number.POSITIVE_INFINITY)
    || (currentItem?.isInStock === false && quantity > currentItem.quantity)
  ) {
    return cart;
  }

  const items =
    quantity <= 0
      ? cart.items.filter((item) => item.productId !== productId)
      : cart.items.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity,
                lineTotal: item.sellingPrice * quantity,
              }
            : item
        );

  const next = recalcCart(items);
  write(CART_KEY, next);
  return next;
}

export function removeGuestCartItem(productId: number): ProfileCart {
  const cart = getGuestCart();
  const next = recalcCart(
    cart.items.filter((item) => item.productId !== productId)
  );
  write(CART_KEY, next);
  return next;
}

export function clearGuestCart(): ProfileCart {
  write(CART_KEY, emptyCart);
  return emptyCart;
}

// ---- guest wishlist ----

export function getGuestWishlist(): ProfileWishlist {
  return read<ProfileWishlist>(WISHLIST_KEY, emptyWishlist);
}

export function toggleGuestWishlistItem(productId: number): ProfileWishlist {
  const wishlist = getGuestWishlist();
  const exists = wishlist.items.some((item) => item.productId === productId);

  let items: ProfileWishlistItem[];
  if (exists) {
    items = wishlist.items.filter((item) => item.productId !== productId);
  } else {
    const info = getCachedInfo(productId);
    items = [
      {
        id: productId,
        productId,
        productName: info?.productName ?? "",
        imageUrl: info?.imageUrl,
        slug: info?.slug,
        sellingPrice: info?.sellingPrice ?? 0,
        oldPrice: info?.oldPrice,
        isInCart: false,
        isInStock: info?.isInStock ?? true,
      },
      ...wishlist.items,
    ];
  }

  const next: ProfileWishlist = { items, totalItems: items.length };
  write(WISHLIST_KEY, next);
  return next;
}

export function clearGuestWishlist(): ProfileWishlist {
  write(WISHLIST_KEY, emptyWishlist);
  return emptyWishlist;
}
