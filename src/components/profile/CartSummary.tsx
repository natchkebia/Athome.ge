"use client";

import styles from "./CartSummary.module.scss";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MinimalProductItem, { ProductItem } from "./MinimalProductItem";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { useCartQuote } from "@/contexts/CartQuoteContext";

interface CartSummaryProps {
  showItems?: boolean;
  deliveryMode?: "unknown" | "pickup" | "courier";
  deliveryAmount?: number | null;
}

export default function CartSummary({
  showItems = true,
  deliveryMode = "unknown",
  deliveryAmount = null,
}: CartSummaryProps) {
  const en = useStorefrontLocale() === "en";
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);
  const { cart } = useCommerce();
  const {
    quote,
    loading: quoteLoading,
    couponCode,
    couponError,
    applyCoupon,
    clearCoupon,
  } = useCartQuote();
  const [couponInput, setCouponInput] = useState(couponCode);

  useEffect(() => setCouponInput(couponCode), [couponCode]);
  // უარყოფილი კოდი ველში რჩება გასასწორებლად — „წაშლა" მხოლოდ მოქმედ კოდზე.
  const couponApplied = Boolean(couponCode && quote?.coupon?.applied);

  const cartItems: ProductItem[] = cart.items
    .map((item) => {
      const quotedLine = quote?.lines.find((line) => line.productId === item.productId);
      return {
      id: item.productId,
      title: item.productName || item.productSku || (en ? `Product #${item.productId}` : `პროდუქტი #${item.productId}`),
      image: normalizeMediaUrl(item.imageUrl),
      price: quotedLine?.unitPrice ?? item.unitPrice ?? item.sellingPrice,
      oldPrice:
        quotedLine && quotedLine.listUnitPrice > quotedLine.unitPrice
          ? quotedLine.listUnitPrice
          : item.compareAtPrice ?? item.oldPrice,
      quantity: item.quantity,
      };
    });

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // ფასდაკლების გარეშე პროდუქტს oldPrice არ აქვს — მაშინ მისი „ძველი ფასი" =
  // მიმდინარე ფასს, რომ დანაზოგში 0 შეიტანოს (და არა უარყოფითი რიცხვი).
  const totalOldPrice = cartItems.reduce(
    (sum, item) => sum + (item.oldPrice ?? item.price) * item.quantity,
    0
  );
  const totalDiscount = Math.max(totalOldPrice - totalPrice, 0);
  const payableTotal = quote?.total ?? totalPrice +
    (deliveryMode === "courier" ? deliveryAmount ?? 0 : 0);
  const otherDiscount = Math.max(
    (quote?.orderDiscount ?? 0) - (quote?.couponDiscount ?? 0),
    0,
  );

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/delivery");
  };

  return (
    <div
      className={`${styles.cartSection} ${
        showItems ? styles.expanded : styles.compact
      }`}
    >
      {showItems && (
        <div className={styles.wrapper}>
          {cartItems.map((item) => (
            <MinimalProductItem key={item.id} item={item} />
          ))}
        </div>
      )}
      <div className={styles.summaryBox}>
        <div className={styles.summary}>
          <div className={styles.row}>
            <p>{en ? "Quantity" : "რაოდენობა"}</p>
            <span>{totalQuantity}x</span>
          </div>

          <div className={styles.row}>
            <p>{en ? "Products" : "პროდუქტები"}</p>
            <span>{(quote?.listSubtotal ?? totalOldPrice).toLocaleString()} ₾</span>
          </div>

          {(quote?.saleDiscount ?? totalDiscount) > 0 && (
            <div className={styles.row}>
              <p>{en ? "Sale discount" : "ფასდაკლება"}</p>
              <span className={styles.discount}>−{(quote?.saleDiscount ?? totalDiscount).toLocaleString()} ₾</span>
            </div>
          )}

          {(quote?.couponDiscount ?? 0) > 0 && (
            <div className={styles.row}>
              <p>{en ? `Coupon ${couponCode}` : `პრომოკოდი ${couponCode}`}</p>
              <span className={styles.discount}>−{quote?.couponDiscount.toLocaleString()} ₾</span>
            </div>
          )}

          {otherDiscount > 0 && (
            <div className={styles.row}>
              <p>{en ? "Other discount" : "სხვა ფასდაკლება"}</p>
              <span className={styles.discount}>−{otherDiscount.toLocaleString()} ₾</span>
            </div>
          )}

          {deliveryMode !== "pickup" && (
            <div className={styles.row}>
              <p>{en ? "Delivery fee" : "მიწოდების საფასური"}</p>
              {quote?.shippingQuoted ? (
                <span>
                  {quote.shippingBeforeDiscount > quote.shipping && (
                    <del>{quote.shippingBeforeDiscount.toLocaleString()} ₾</del>
                  )}{" "}{quote.shipping.toLocaleString()} ₾
                </span>
              ) : deliveryMode === "courier" && deliveryAmount != null ? (
                <span>{deliveryAmount.toLocaleString()} ₾</span>
              ) : (
                <span className={styles.deliveryByAddress}>
                  {en ? "Based on address" : "მისამართის მიხედვით"}
                </span>
              )}
            </div>
          )}

          <div className={styles.totalRow}>
            <p>{en ? "Total" : "ჯამი"}</p>
            <span>{payableTotal.toLocaleString()} ₾</span>
          </div>

          {(quote?.totalSavings ?? totalDiscount) > 0 && (
            <div className={styles.savingsRow}>
              <p>{en ? "You save" : "დაზოგავთ"}</p>
              <span>{(quote?.totalSavings ?? totalDiscount).toLocaleString()} ₾</span>
            </div>
          )}

          <form
            className={styles.couponForm}
            onSubmit={(event) => {
              event.preventDefault();
              void applyCoupon(couponInput);
            }}
          >
            <div>
              <input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder={en ? "Promo code" : "პრომოკოდი"}
                aria-label={en ? "Promo code" : "პრომოკოდი"}
              />
              {couponApplied ? (
                <button type="button" onClick={clearCoupon}>{en ? "Remove" : "წაშლა"}</button>
              ) : (
                <button type="submit" disabled={!couponInput.trim() || quoteLoading}>
                  {quoteLoading ? "…" : en ? "Apply" : "გამოყენება"}
                </button>
              )}
            </div>
            {couponError && <p className={styles.couponError}>{couponError}</p>}
          </form>
        </div>
        {!showItems && (
          <button
            className={`${styles.button} ${isContinuing ? styles.loading : ""}`}
            onClick={handleContinue}
            disabled={isContinuing}
          >
            {isContinuing && <span className={styles.spinner} />}
            <span>{en ? "Proceed to checkout" : "ყიდვის გაგრძელება"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
