"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CategoryCard.module.scss";

interface CategoryCardProps {
  title: string;
  mobileTitle?: string;
  image?: string;
  bgColor: string;
  slug: string;
  count?: number;
  mobileCompact?: boolean;
}

export default function CategoryCard({
  title,
  mobileTitle,
  image,
  bgColor,
  slug,
  count,
  mobileCompact = false,
}: CategoryCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
    <Link href={`/products/${slug}`} className={styles.cardLink}>
      <div
        className={`${styles.card} ${mobileCompact ? styles.mobileCompact : ""}`}
        style={{ backgroundColor: bgColor, "--category-background": bgColor } as React.CSSProperties}
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt={title}
            className={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            {title.slice(0, 1)}
          </span>
        )}
        <p className={styles.label}>
          {mobileTitle ? (
            <>
              <span className={styles.regularTitle}>{title}</span>
              <span className={styles.mobileTitle}>{mobileTitle}</span>
            </>
          ) : title}
        </p>
        {typeof count === "number" && (
          <span className={styles.count}>{count} პროდუქტი</span>
        )}
      </div>
    </Link>
  );
}
