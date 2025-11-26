"use client";

import { useState } from "react";
import styles from "./ProductGallery.module.scss";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        <button
          className={`${styles.arrowBtn} ${styles.left}`}
          onClick={handlePrev}
        >
          <img src="/icons/DiscountArrow.svg" alt="DiscountArrow.svg" />
        </button>

        <Image
          src={images[currentIndex]}
          alt={`product-image-${currentIndex}`}
          width={300}
          height={300}
          className={styles.mainImage}
        />

        <button
          className={`${styles.arrowBtn} ${styles.right}`}
          onClick={handleNext}
        >
          <img src="/icons/DiscountArrowLeft.svg" alt="DiscountArrowLeft.svg" />
        </button>

        <div className={styles.thumbnails}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`${styles.thumbBox} ${
                currentIndex === i ? styles.active : ""
              }`}
            >
              <Image src={img} alt={`thumb-${i}`} width={148} height={150} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
