"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ProductGallery.module.scss";
import Image from "next/image";
import { img } from "@/lib/media/img";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = thumbnailsRef.current;
    const thumbnail = thumbnailRefs.current[currentIndex];
    if (!container || !thumbnail) return;

    container.scrollTo({
      left:
        thumbnail.offsetLeft -
        (container.clientWidth - thumbnail.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [currentIndex]);

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
          src={img(images[currentIndex], 800)}
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

        <div ref={thumbnailsRef} className={styles.thumbnails}>
          {images.map((imageUrl, i) => (
            <button
              key={i}
              ref={(element) => {
                thumbnailRefs.current[i] = element;
              }}
              onClick={() => handleSelect(i)}
              className={`${styles.thumbBox} ${
                currentIndex === i ? styles.active : ""
              }`}
            >
              <Image
                src={img(imageUrl, 200)}
                alt={`thumb-${i}`}
                width={148}
                height={150}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
