"use client";

import React from "react";
import Link from "next/link";
import styles from "./CategoryCard.module.scss";

interface CategoryCardProps {
  title: string;
  image?: string;
  bgColor: string;
  slug: string;
  count?: number;
}

export default function CategoryCard({
  title,
  image,
  bgColor,
  slug,
  count,
}: CategoryCardProps) {
  return (
    <Link href={`/products/${slug}`} className={styles.cardLink}>
      <div className={styles.card} style={{ backgroundColor: bgColor }}>
        {image ? (
          <img src={image} alt={title} className={styles.image} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            {title.slice(0, 1)}
          </span>
        )}
        <p className={styles.label}>{title}</p>
        {typeof count === "number" && (
          <span className={styles.count}>{count} პროდუქტი</span>
        )}
      </div>
    </Link>
  );
}
