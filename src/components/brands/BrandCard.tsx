"use client";
import { useState } from "react";
import styles from "./BrandCard.module.scss";

interface BrandCardProps {
  image: string;
  alt?: string;
}

export default function BrandCard({ image, alt = "brand" }: BrandCardProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.wrapper}>
      {failed ? (
        <span className={styles.fallback}>{alt}</span>
      ) : (
        <img
          src={image}
          alt={alt}
          width={72}
          height={72}
          decoding="async"
          onError={() => {
            setFailed(true);
          }}
        />
      )}
    </div>
  );
}
