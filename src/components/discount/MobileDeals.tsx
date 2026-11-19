"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StorefrontProduct } from "@/lib/api/storefront";
import { mapStorefrontProductToCard } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import styles from "./MobileDeals.module.scss";

export default function MobileDeals({ products, dailyOffers = [] }: {
  products: StorefrontProduct[];
  dailyOffers?: StorefrontProduct[];
}) {
  const en = useStorefrontLocale() === "en";
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const candidates = [...dailyOffers.filter((product) => product.isDealOfDay), ...products];
  const offers = candidates.filter((product, index) => {
    const expires = Date.parse(product.activePromotion?.endsAt ?? "");
    return candidates.findIndex((candidate) => candidate.id === product.id) === index &&
      product.isAvailable && (product.compareAtPrice ?? 0) > product.effectivePrice &&
      (!Number.isFinite(expires) || now === null || expires > now);
  });
  const featured = offers.find((product) => product.isDealOfDay) ?? offers[0];
  if (!featured) return null;

  const card = mapStorefrontProductToCard(featured);
  const endTime = featured.isDealOfDay ? Date.parse(featured.activePromotion?.endsAt ?? "") : NaN;
  const remaining = now !== null && Number.isFinite(endTime)
    ? Math.max(0, Math.floor((endTime - now) / 1000)) : null;
  const time = remaining === null ? ["--", "--", "--"] : [
    Math.floor(remaining / 3600), Math.floor(remaining / 60) % 60, remaining % 60,
  ].map((value) => String(value).padStart(2, "0"));
  const price = (value: number) => `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)} ₾`;
  const href = (product: StorefrontProduct) => `/products/${product.category.slug}/${product.slug}`;

  return (
    <section className={styles.section} aria-label={en ? "Discounts" : "ფასდაკლებები"}>
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 4h8l10 10-7 7L3 10V4Z" />
            <circle cx="7.5" cy="8" r="1" />
          </svg>
        </span>
        <h2>{en ? "Discounts" : "ფასდაკლებები"}</h2>
        <div className={styles.timer} role="timer" aria-label={remaining === null
          ? (en ? "Offer end time is not available" : "შეთავაზების დასრულების დრო ჯერ არ არის მითითებული")
          : (en ? `${time[0]} hours, ${time[1]} minutes, ${time[2]} seconds left`
            : `დარჩენილია ${time[0]} საათი, ${time[1]} წუთი, ${time[2]} წამი`)}>
          {time.map((value, index) => <span key={index} aria-hidden="true">{value}</span>)}
        </div>
      </header>

      <Link href={href(featured)} className={styles.featured}>
        <div className={styles.featuredImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt="" loading="lazy" />
        </div>
        <div className={styles.featuredInfo}>
          <span className={styles.badge}>
            {featured.isDealOfDay ? (en ? "Deal of the day" : "დღის შეთავაზება") : (en ? "Special offer" : "შეთავაზება")} · -{card.discount}%
          </span>
          <h3>{featured.shortTitle || featured.name}</h3>
          <div className={styles.prices}>
            <strong>{price(featured.effectivePrice)}</strong>
            {card.oldPrice && <del>{price(card.oldPrice)}</del>}
          </div>
        </div>
      </Link>

      {offers.length > 1 && <div className={styles.track} aria-label={en ? "More discounts" : "სხვა ფასდაკლებები"}>
        {offers.filter((product) => product.id !== featured.id).map((product) => {
          const item = mapStorefrontProductToCard(product);
          return <Link key={product.id} href={href(product)} className={styles.product}>
            <div className={styles.productImage}>
              <span className={styles.badge}>-{item.discount}%</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" loading="lazy" />
            </div>
            <h3>{product.shortTitle || product.name}</h3>
            <div className={styles.prices}>
              <strong>{price(product.effectivePrice)}</strong>
              {item.oldPrice && <del>{price(item.oldPrice)}</del>}
            </div>
          </Link>;
        })}
      </div>}
    </section>
  );
}
