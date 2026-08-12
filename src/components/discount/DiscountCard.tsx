"use client";

import styles from "./DiscountCard.module.scss";
import Image from "next/image";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCompare } from "@/contexts/CompareContext";
import { useToast } from "@/contexts/ToastContext";
import { cacheProductInfo } from "@/lib/commerce/guestStore";
import { flyToTarget } from "@/lib/ui/flyToCart";
import { img } from "@/lib/media/img";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export interface ProductCardProps {
  id: string;
  discount?: number;
  promotionLabel?: string;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  isNew?: boolean;
  isAvailable?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  category?: string;
  subCategory?: string;
  slug?: string;
  layout?: "grid" | "list";
}

function ZoomIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DiscountCard({
  id,
  discount = 0,
  promotionLabel,
  image,
  title,
  oldPrice,
  newPrice,
  isNew = false,
  isAvailable = true,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  category,
  slug,
  layout = "grid",
}: ProductCardProps) {
  const locale = useStorefrontLocale();
  const en = locale === "en";
  const { toggleCompare, compareIds, maxItems } = useCompare();
  const { showToast } = useToast();
  const isCompared = compareIds.has(Number(id));
  // fly-to-cart ანიმაციის წყარო — პროდუქტის სურათის კონტეინერი.
  const imageRef = useRef<HTMLDivElement>(null);
  // ლუპა — გადიდებული სურათის ფანჯარა (zoom-on-hover).
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [zoomActive, setZoomActive] = useState(false);

  const openZoom = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setZoomActive(false);
    setZoomOrigin("50% 50%");
    setZoomOpen(true);
  };

  const closeZoom = (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setZoomOpen(false);
    setZoomActive(false);
  };

  // კურსორის მიხედვით ვადგენთ გადიდების ცენტრს.
  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleCompare = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const result = toggleCompare({
      id: Number(id),
      slug: slug ?? "",
      category: category ?? "",
      title,
      image,
      newPrice,
      oldPrice,
    });

    if (result === "added") showToast(en ? "Added to comparison" : "შედარების სიაში დაემატა");
    else if (result === "removed") showToast(en ? "Removed from comparison" : "შედარების სიიდან ამოიშალა");
    else showToast(en ? `You can compare up to ${maxItems} products` : `შედარებაში მაქსიმუმ ${maxItems} პროდუქტია`, "error");
  };

  // სტუმრის კალათა/სურვილებისთვის — ჩვენების ინფოს ქეშირება add-ისას.
  const cacheInfo = () =>
    cacheProductInfo({
      productId: Number(id),
      productName: title,
      imageUrl: image,
      slug,
      sellingPrice: newPrice ?? 0,
      oldPrice,
    });

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cacheInfo();
    const wasWishlisted = isWishlisted;
    // ჯერ რეალური დამატება, მერე ანიმაცია — რომ add ყოველთვის შესრულდეს.
    onToggleWishlist?.(id);
    // ვიშლისტში დამატებისას (არა ამოშლისას) — სურათი გულის აიქონისკენ გაფრინდეს.
    if (!wasWishlisted) flyToTarget(imageRef.current, image, "wishlist");
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAvailable) return;
    cacheInfo();
    onAddToCart?.(id);
    flyToTarget(imageRef.current, image, "cart");
  };

  // გადიდებული სურათის ფანჯარა — portal-ით body-ზე, რომ ბარათის hover-transform-მა
  // და overflow-მა fixed overlay არ დაამახინჯოს.
  const zoomOverlay =
    zoomOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className={styles.zoomOverlay}
            onClick={closeZoom}
            role="dialog"
            aria-label={title}
          >
      <button
        type="button"
        className={styles.zoomClose}
        onClick={closeZoom}
        aria-label={en ? "Close" : "დახურვა"}
      >
        ×
      </button>
      <div
        className={styles.zoomBox}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleZoomMove}
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(image, 1400)}
          alt={title}
          className={styles.zoomImg}
          style={{
            transformOrigin: zoomOrigin,
            transform: zoomActive ? "scale(2.2)" : "scale(1)",
          }}
        />
      </div>
            <p className={styles.zoomHint}>{en ? "Hover to zoom" : "გასადიდებლად გადაატარეთ კურსორი"}</p>
          </div>,
          document.body
        )
      : null;

  // სიის (list) ვიზუალი — ჰორიზონტალური გაშლილი ბარათი (1038×172).
  if (layout === "list") {
    return (
      <div className={`${styles.cardList} ${!isAvailable ? styles.outOfStockCard : ""}`}>
        <div className={styles.listImage} ref={imageRef}>
          {(promotionLabel || discount > 0) && (
            <div className={styles.discountBadge}>{promotionLabel || `-${discount}%`}</div>
          )}
          {isNew && <div className={styles.newBadge}>NEW</div>}
          {!isAvailable && <div className={styles.outOfStockBadge}>{en ? "Out of stock" : "ამოწურულია"}</div>}
          <Image
            className={styles.productImage}
            src={img(image, 400)}
            alt={title}
            width={140}
            height={140}
          />
        </div>

        <div className={styles.listMain}>
          <h3 className={styles.listTitle}>{title}</h3>
          <div className={styles.priceBox}>
            {newPrice !== undefined && (
              <span className={styles.newPrice}>{newPrice.toFixed(2)} ₾</span>
            )}
            {oldPrice !== undefined && (
              <span className={styles.oldPrice}>{oldPrice.toFixed(2)} ₾</span>
            )}
          </div>
        </div>

        <div className={styles.listActions}>
          <button
            className={styles.listIconBtn}
            onClick={openZoom}
            aria-label="სურათის გადიდება"
          >
            <ZoomIcon />
          </button>
          <button
            className={`${styles.listIconBtn} ${
              isCompared ? styles.listIconBtnActive : ""
            }`}
            onClick={handleCompare}
            aria-pressed={isCompared}
            aria-label="compare"
          >
            <img src="/icons/Arrows.svg" alt="compare" />
          </button>
          <button
            className={styles.listIconBtn}
            onClick={handleWishlist}
            aria-pressed={isWishlisted}
            aria-label="wishlist"
          >
            <img
              src={isWishlisted ? "/icons/redHeart.svg" : "/icons/Heart.svg"}
              alt="wishlist"
            />
          </button>
          <button className={styles.addBtn} onClick={handleAddToCart} disabled={!isAvailable}>
            <img src="/icons/CartWhite.svg" alt="cart" />
            {isAvailable ? (en ? "Add to cart" : "დამატება") : (en ? "Out of stock" : "ამოწურულია")}
          </button>
        </div>
        {zoomOverlay}
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${!isAvailable ? styles.outOfStockCard : ""}`}>
      <div className={styles.cardWrapper}>
        {(promotionLabel || discount > 0 || isNew) && (
          <div className={styles.badges}>
            {(promotionLabel || discount > 0) && (
              <div className={styles.discountBadge}>{promotionLabel || `-${discount}%`}</div>
            )}
            {isNew && <div className={styles.newBadge}>NEW</div>}
          </div>
        )}
        {!isAvailable && <div className={styles.outOfStockBadge}>{en ? "Out of stock" : "ამოწურულია"}</div>}

        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={handleWishlist}
            aria-pressed={isWishlisted}
            aria-label="wishlist"
          >
            <img
              src={isWishlisted ? "/icons/redHeart.svg" : "/icons/Heart.svg"}
              alt="wishlist"
            />
          </button>
          <button
            className={`${styles.iconBtn} ${
              isCompared ? styles.iconBtnActive : ""
            }`}
            onClick={handleCompare}
            aria-pressed={isCompared}
            aria-label="compare"
          >
            <img src="/icons/Arrows.svg" alt="compare" />
          </button>
          <button
            className={styles.iconBtn}
            onClick={openZoom}
            aria-label="სურათის გადიდება"
          >
            <ZoomIcon />
          </button>
        </div>

        <div className={styles.imageWrapper} ref={imageRef}>
          <Image
            className={styles.productImage}
            src={img(image, 400)}
            alt={title}
            width={172}
            height={172}
          />
        </div>
      </div>

      <h3 className={styles.title}>{title}</h3>

      <div className={styles.priceWrapper}>
        <div className={styles.priceBox}>
          {newPrice !== undefined && (
            <span className={styles.newPrice}>{newPrice.toFixed(2)} ₾</span>
          )}
          {oldPrice !== undefined && (
            <span className={styles.oldPrice}>{oldPrice.toFixed(2)} ₾</span>
          )}
        </div>

        <button className={styles.addBtn} onClick={handleAddToCart} disabled={!isAvailable}>
          <img src="/icons/CartWhite.svg" alt="cart" />
          {isAvailable ? (en ? "Add to cart" : "დამატება") : (en ? "Out of stock" : "ამოწურულია")}
        </button>
      </div>
      {zoomOverlay}
    </div>
  );
}
