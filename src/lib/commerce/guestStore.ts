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
  map[info.productId] = info;
  write(INFO_KEY, map);
}

function getCachedInfo(productId: number): GuestProductInfo | null {
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

export function addGuestCartItem(productId: number, quantity = 1): ProfileCart {
  const cart = getGuestCart();
  const info = getCachedInfo(productId);
  const items = [...cart.items];
  const index = items.findIndex((item) => item.productId === productId);

  if (index >= 0) {
    const newQty = items[index].quantity + quantity;
    items[index] = {
      ...items[index],
      quantity: newQty,
      lineTotal: items[index].sellingPrice * newQty,
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
