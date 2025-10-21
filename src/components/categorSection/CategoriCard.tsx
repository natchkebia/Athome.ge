"use client";

import React from "react";
import styles from "./CategoryCard.module.scss";

interface CategoryCardProps {
  title: string;
  image: string;
  bgColor: string;
}

export default function CategoryCard({ title, image, bgColor }: CategoryCardProps) {
  return (
    <div className={styles.card} style={{ backgroundColor: bgColor }}>
      <img src={image} alt={title} className={styles.image} />
      <p className={styles.label}>{title}</p>
    </div>
  );
}
