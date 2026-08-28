"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare } from "@/contexts/CompareContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { img } from "@/lib/media/img";
import styles from "./CompareBar.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function CompareBar() {
  const en = useStorefrontLocale() === "en";
  const { items, removeCompare, clearCompare } = useCompare();
  const pathname = usePathname();
  const isProductDetailPage =
    pathname.startsWith("/products/") &&
    !pathname.startsWith("/products/brand/") &&
    pathname.split("/").filter(Boolean).length >= 3;
  const barRef = useRef<HTMLDivElement>(null);
  const isVisible = items.length > 0 && pathname !== "/compare";

  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;

    if (!isVisible || !bar) {
      root.style.removeProperty("--compare-bar-height");
      return;
    }

    const updateHeight = () => {
      root.style.setProperty("--compare-bar-height", `${bar.getBoundingClientRect().height}px`);
    };
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--compare-bar-height");
    };
  }, [isVisible]);

  // ცარიელ სიაზე და თვითონ შედარების გვერდზე ბარი არ გვჭირდება.
  if (!isVisible) return null;

  return (
    <>
      <div className={styles.pageSpacer} aria-hidden="true" />
      <div
        ref={barRef}
        className={`${styles.bar} ${
          isProductDetailPage ? styles.productDetailOffset : ""
        }`}
      >
        <div className={styles.inner}>
        <div className={styles.items}>
          {items.map((item) => (
            <div key={item.id} className={styles.chip}>
              <button
                className={styles.remove}
                onClick={() => removeCompare(item.id)}
                aria-label={en ? "Remove" : "წაშლა"}
              >
                ×
              </button>
              <div className={styles.thumb}>
                <img
                  src={img(normalizeMediaUrl(item.image), 100)}
                  alt={item.title}
                />
              </div>
              <div className={styles.info}>
                <span className={styles.title}>{item.title}</span>
                {item.newPrice !== undefined && (
                  <span className={styles.price}>
                    {item.newPrice.toFixed(2)} ₾
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href="/compare" className={styles.compareBtn}>
            <img src="/icons/Arrows.svg" alt="" />
            {en ? "Compare" : "შედარება"}
          </Link>
          <button className={styles.clear} onClick={clearCompare}>
            {en ? "Remove all products" : "ყველა პროდუქტის წაშლა"}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
