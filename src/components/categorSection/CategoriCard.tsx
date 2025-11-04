"use client";

import React from "react";
import Link from "next/link";
import styles from "./CategoryCard.module.scss";

interface CategoryCardProps {
  title: string;
  image: string;
  bgColor: string;
}

export default function CategoryCard({ title, image, bgColor }: CategoryCardProps) {
  // URL-safe ფორმატისთვის, encodeURIComponent ვიყენებთ
  const slug = encodeURIComponent(title);

  return (
    <Link href={`/products/${slug}`} className={styles.cardLink}>
      <div className={styles.card} style={{ backgroundColor: bgColor }}>
        <img src={image} alt={title} className={styles.image} />
        <p className={styles.label}>{title}</p>
      </div>
    </Link>
  );
}
