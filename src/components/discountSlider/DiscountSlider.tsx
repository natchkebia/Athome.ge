"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./DiscountSlider.module.scss";
import {
  getStorefrontBanners,
  StorefrontBanner,
  StorefrontPromotionBanner,
} from "@/lib/api/storefront";
import { normalizeMediaUrl } from "@/lib/storefront/products";

type DiscountSliderProps = {
  banners?: StorefrontPromotionBanner[];
};

export default function DiscountSlider({
  banners: providedBanners,
}: DiscountSliderProps) {
  const [fetchedBanners, setFetchedBanners] = useState<StorefrontBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (providedBanners) return;

    let isMounted = true;

    getStorefrontBanners("promotional")
      .then((items) => {
        if (!isMounted) return;

        setFetchedBanners(
          [...items].sort((a, b) => a.sortOrder - b.sortOrder)
        );
        setCurrentIndex(0);
      })
      .catch(() => {
        if (isMounted) setFetchedBanners([]);
      });

    return () => {
      isMounted = false;
    };
  }, [providedBanners]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 560px)");

    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  const promotionBanners = providedBanners ?? fetchedBanners;
  const slideCount = promotionBanners.length;
  const currentPromotion = promotionBanners[currentIndex];
  const promotionImage = useMemo(() => {
    if (!currentPromotion) return "";

    const mobileImageUrl =
      "mobileImageUrl" in currentPromotion
        ? currentPromotion.mobileImageUrl
        : undefined;

    return isMobile && mobileImageUrl
      ? normalizeMediaUrl(mobileImageUrl, "")
      : normalizeMediaUrl(currentPromotion.imageUrl, "");
  }, [currentPromotion, isMobile]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!currentPromotion || !promotionImage) {
    return null;
  }

  return (
    <div
      className={`${styles.sliderContainer} ${styles.promotionContainer}`}
      style={{
        backgroundImage: `url(${promotionImage})`,
      }}
    >
      <h3 className={styles.title}>{currentPromotion.title}</h3>

      <div className={styles.sliderContent}>
        <button
          onClick={handlePrev}
          className={`${styles.arrow} ${styles.left}`}
        >
          &#10094;
        </button>

        <a className={styles.promotionLink} href={currentPromotion.linkUrl}>
          <span>
            {"subtitle" in currentPromotion
              ? currentPromotion.subtitle
              : currentPromotion.title}
          </span>
          {"ctaLabel" in currentPromotion && currentPromotion.ctaLabel && (
            <strong>{currentPromotion.ctaLabel}</strong>
          )}
        </a>

        <button
          onClick={handleNext}
          className={`${styles.arrow} ${styles.right}`}
        >
          &#10095;
        </button>
      </div>

      <div className={styles.dots}>
        {Array.from({ length: slideCount }).map((_, index) => (
          <span
            key={index}
            onClick={() => handleDotClick(index)}
            className={`${styles.dot} ${
              currentIndex === index ? styles.active : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
