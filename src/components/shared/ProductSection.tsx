"use client";

import styles from "./ProductSection.module.scss";
import DiscountSlider from "../discount/DiscountSlider";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface Product {
  id: number;
  discount?: number;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  category?: string;
  isNew?: boolean;
}

interface ProductSectionProps {
  icon: string;
  title: string;
  products: Product[];
  compact?: boolean;
  flush?: boolean;
  fixedCardSize?: boolean;
}

export default function ProductSection({
  icon,
  title,
  products,
  compact = false,
  flush = false,
  fixedCardSize = false,
}: ProductSectionProps) {
  const locale = useStorefrontLocale();
  const englishTitles: Record<string, string> = {
    კომპიუტერები: "Computers",
    მონიტორები: "Monitors",
    პერიფერია: "Peripherals",
    "მაგიდები და სავარძლები": "Desks and chairs",
    ალტერნატივები: "Alternatives",
    "მსგავსი პროდუქტები": "Similar products",
    აქსესუარები: "Accessories",
    "დაამატე შეკვეთას": "Frequently bought together",
  };
  const visibleTitle = locale === "en" ? englishTitles[title] ?? title : title;
  return (
    <div className={styles.section}>
      <div
        className={`${styles.sectionHeader} ${
          compact ? styles.compactHeader : ""
        }`}
      >
        <img src={icon} alt={visibleTitle} />
        <span className={styles.sectionTitle}>{visibleTitle}</span>
      </div>

      <DiscountSlider
        compact={compact}
        flush={flush}
        fixedCardSize={fixedCardSize}
        products={products.map((p) => ({
          ...p,
          oldPrice: p.oldPrice ?? undefined,
        }))}
      />
    </div>
  );
}
