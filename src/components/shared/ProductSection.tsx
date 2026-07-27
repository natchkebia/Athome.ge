"use client";

import styles from "./ProductSection.module.scss";
import DiscountSlider from "../discount/DiscountSlider";

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
}

export default function ProductSection({
  icon,
  title,
  products,
  compact = false,
}: ProductSectionProps) {
  return (
    <div className={styles.section}>
      <div
        className={`${styles.sectionHeader} ${
          compact ? styles.compactHeader : ""
        }`}
      >
        <img src={icon} alt={title} />
        <span className={styles.sectionTitle}>{title}</span>
      </div>

      <DiscountSlider
        compact={compact}
        products={products.map((p) => ({
          ...p,
          oldPrice: p.oldPrice ?? undefined,
        }))}
      />
    </div>
  );
}
