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
import { useCommerce } from "@/contexts/CommerceContext";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import {
  getCartQuote,
  type CartQuote,
  type CartQuoteRequest,
} from "@/lib/api/cartQuote";

type DeliveryQuoteSelection = Pick<
  CartQuoteRequest,
  "deliveryType" | "shippingMethodId" | "city" | "region" | "expressDelivery"
>;

type CartQuoteContextValue = {
  quote: CartQuote | null;
  loading: boolean;
  error: string | null;
  couponCode: string;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<void>;
  clearCoupon: () => void;
  setCustomerEmail: (email: string) => void;
  setDeliverySelection: (selection: DeliveryQuoteSelection) => void;
  setCouponError: (message: string | null) => void;
  refreshQuote: () => Promise<void>;
};

const CartQuoteContext = createContext<CartQuoteContextValue | null>(null);
const COUPON_KEY = "athomeCouponCode";

function storeCoupon(code: string) {
  try {
    if (code) sessionStorage.setItem(COUPON_KEY, code);
    else sessionStorage.removeItem(COUPON_KEY);
  } catch {
    // sessionStorage მიუწვდომელია (private რეჟიმი) — კოდი მხოლოდ მეხსიერებაში რჩება.
  }
}

export function CartQuoteProvider({ children }: { children: React.ReactNode }) {
  const { cart } = useCommerce();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliverySelection, setDeliverySelectionState] = useState<DeliveryQuoteSelection>({});
  // checkout-ის კომპონენტები ამას ყოველ რენდერზე ახალი ობიექტით იძახებენ —
  // იგივე მნიშვნელობაზე state არ იცვლება, თორემ quote უსასრულოდ იგზავნება.
  const setDeliverySelection = useCallback((next: DeliveryQuoteSelection) => {
    setDeliverySelectionState((prev) => {
      const keys = new Set([...Object.keys(prev), ...Object.keys(next)]) as Set<keyof DeliveryQuoteSelection>;
      for (const key of keys) {
        if (prev[key] !== next[key]) return next;
      }
      return prev;
    });
  }, []);
  // სანამ შენახული კოდი არ წავიკითხეთ, quote არ იგზავნება — თორემ ორი მოთხოვნა ეჯიბრება.
  const [couponLoaded, setCouponLoaded] = useState(false);
  // მხოლოდ ბოლო მოთხოვნის პასუხი ითვლება; გვიან მოსული ძველი პასუხი (მაგ. წაშლილი კოდით) იგნორირდება.
  const requestSeq = useRef(0);

  useEffect(() => {
    try {
      setCouponCode(sessionStorage.getItem(COUPON_KEY) ?? "");
    } catch {
      // ignore
    }
    setCouponLoaded(true);
  }, []);

  const refreshQuote = useCallback(async () => {
    if (!couponLoaded) return;
    const seq = ++requestSeq.current;
    if (cart.items.length === 0) {
      setQuote(null);
      setLoading(false);
      return;
    }

    const authenticated = Boolean(getStoredAuthTokens()?.accessToken);
    const payload: CartQuoteRequest = {
      ...(!authenticated
        ? {
            items: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              ...(item.swaps?.length ? { swaps: item.swaps } : {}),
            })),
          }
        : {}),
      ...(couponCode ? { couponCode } : {}),
      ...(customerEmail ? { email: customerEmail } : {}),
      ...deliverySelection,
    };

    setLoading(true);
    setError(null);
    try {
      const nextQuote = await getCartQuote(payload);
      if (seq !== requestSeq.current) return;
      setQuote(nextQuote);
      setCouponError(
        nextQuote.coupon && !nextQuote.coupon.applied
          ? nextQuote.coupon.message || "პრომოკოდი არ მოქმედებს"
          : null,
      );
    } catch (quoteError) {
      if (seq !== requestSeq.current) return;
      setError(
        quoteError instanceof Error
          ? quoteError.message
          : "კალათის ჯამის გამოთვლა ვერ მოხერხდა",
      );
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [cart.items, couponCode, couponLoaded, customerEmail, deliverySelection]);

  useEffect(() => {
    void refreshQuote();
  }, [refreshQuote]);

  const applyCoupon = useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase();
      setCouponError(null);
      if (normalized === couponCode) {
        await refreshQuote();
        return;
      }
      setCouponCode(normalized);
      storeCoupon(normalized);
    },
    [couponCode, refreshQuote],
  );

  const clearCoupon = useCallback(() => {
    setCouponCode("");
    setCouponError(null);
    storeCoupon("");
  }, []);

  const value = useMemo(
    () => ({
      quote,
      loading,
      error,
      couponCode,
      couponError,
      applyCoupon,
      clearCoupon,
      setCustomerEmail,
      setDeliverySelection,
      setCouponError,
      refreshQuote,
    }),
    [
      applyCoupon,
      clearCoupon,
      couponCode,
      couponError,
      error,
      loading,
      quote,
      refreshQuote,
      setDeliverySelection,
    ],
  );

  return (
    <CartQuoteContext.Provider value={value}>
      {children}
    </CartQuoteContext.Provider>
  );
}

export function useCartQuote() {
  const context = useContext(CartQuoteContext);
  if (!context) throw new Error("useCartQuote must be used inside CartQuoteProvider");
  return context;
}
