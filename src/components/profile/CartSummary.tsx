"use client";

import styles from "./CartSummary.module.scss";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MinimalProductItem, { ProductItem } from "./MinimalProductItem";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

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
  const cartItems: ProductItem[] = cart.items
    .filter((item) => item.productName)
    .map((item) => ({
      id: item.productId,
      title: item.productName,
      image: normalizeMediaUrl(item.imageUrl),
      price: item.sellingPrice,
      oldPrice: item.oldPrice,
      quantity: item.quantity,
    }));

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
  const payableTotal = totalPrice +
    (deliveryMode === "courier" ? deliveryAmount ?? 0 : 0);

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/delivery");
  };

  return (
    <div
      className={styles.cartSection}
      style={{ height: showItems ? "451px" : "280px" }}
    >
      {showItems && (
        <div className={styles.wrapper}>
          {cartItems.map((item) => (
            <MinimalProductItem key={item.id} item={item} />
          ))}
        </div>
      )}
      <div className={styles.summaryBox}>
        <div
          className={styles.summary}
          style={{ marginTop: showItems ? "" : "0px" }}
        >
          <div className={styles.row}>
            <p>{en ? "Quantity" : "რაოდენობა"}</p>
            <span>{totalQuantity}x</span>
          </div>

          <div className={styles.row}>
            <p>{en ? "Subtotal" : "ღირებულება"}</p>
            <span>{totalPrice.toLocaleString()} ₾</span>
          </div>

          {totalDiscount > 0 && (
            <div className={styles.row}>
              <p>{en ? "Savings" : "დანაზოგი"}</p>
              <span>{totalDiscount.toLocaleString()} ₾</span>
            </div>
          )}

          {deliveryMode !== "pickup" && (
            <div className={styles.row}>
              <p>{en ? "Delivery fee" : "მიწოდების საფასური"}</p>
              {deliveryMode === "courier" && deliveryAmount != null ? (
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
        </div>
        {!showItems && (
          <button
            className={`${styles.button} ${isContinuing ? styles.loading : ""}`}
            onClick={handleContinue}
            disabled={isContinuing}
            style={{ marginTop: showItems ? "" : "10px" }}
          >
            {isContinuing && <span className={styles.spinner} />}
            <span>{en ? "Proceed to checkout" : "ყიდვის გაგრძელება"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
