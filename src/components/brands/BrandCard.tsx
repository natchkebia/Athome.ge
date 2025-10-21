"use client";
import styles from "./BrandCard.module.scss";

interface BrandCardProps {
  image: string;
  alt?: string;
}

export default function BrandCard({ image, alt = "brand" }: BrandCardProps) {
  return (
    <div className={styles.wrapper}>
      <img src={image} alt={alt} />
    </div>
  );
}
