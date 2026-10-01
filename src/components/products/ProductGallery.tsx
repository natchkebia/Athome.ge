"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProductGallery.module.scss";
import Image from "next/image";
import { img } from "@/lib/media/img";

export type ProductGalleryImage = {
  url: string;
  altText?: string;
};

interface ProductGalleryProps {
  images: ProductGalleryImage[];
  discountPercent?: number;
}

export default function ProductGallery({
  images,
  discountPercent = 0,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialImageLoaded, setInitialImageLoaded] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [zoomReadyUrls, setZoomReadyUrls] = useState<Set<string>>(() => new Set());
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const imageUrlsKey = images.map((image) => image.url).join("\u0000");

  const currentImage = images[currentIndex];
  const currentUrl = currentImage?.url ?? "";
  const mainSrc = useMemo(() => {
    if (zooming && zoomReadyUrls.has(currentUrl)) return img(currentUrl, 1600);
    return img(currentUrl, 800);
  }, [currentUrl, zoomReadyUrls, zooming]);
  const mainSrcSet = zooming && zoomReadyUrls.has(currentUrl)
    ? `${img(currentUrl, 1600)} 1x`
    : `${img(currentUrl, 800)} 1x, ${img(currentUrl, 1200)} 2x`;

  useEffect(() => {
    setCurrentIndex(0);
    setInitialImageLoaded(false);
    setZooming(false);
    setZoomReadyUrls(new Set());
  }, [imageUrlsKey]);

  useEffect(() => {
    const imageUrls = imageUrlsKey ? imageUrlsKey.split("\u0000") : [];
    if (!initialImageLoaded || imageUrls.length < 2) return;

    const preload = () => {
      imageUrls.forEach((url) => {
        const preloadImage = new window.Image();
        preloadImage.src = img(url, 800);
      });
    };
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(preload);
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(preload, 250);
    return () => window.clearTimeout(timeoutId);
  }, [imageUrlsKey, initialImageLoaded]);

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
    setZooming(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setZooming(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleSelect = (index: number) => {
    setZooming(false);
    setCurrentIndex(index);
  };

  const handleZoomStart = useCallback(() => {
    if (!currentUrl) return;
    setZooming(true);
    if (zoomReadyUrls.has(currentUrl)) return;

    const zoomImage = new window.Image();
    zoomImage.onload = () => {
      setZoomReadyUrls((readyUrls) => {
        if (readyUrls.has(currentUrl)) return readyUrls;
        const next = new Set(readyUrls);
        next.add(currentUrl);
        return next;
      });
    };
    zoomImage.src = img(currentUrl, 1600);
  }, [currentUrl, zoomReadyUrls]);

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        {discountPercent > 0 && (
          <div className={styles.discountBadge}>
            {Math.abs(discountPercent)}%
          </div>
        )}

        <button
          className={`${styles.arrowBtn} ${styles.left}`}
          onClick={handlePrev}
        >
          <img src="/icons/DiscountArrow.svg" alt="DiscountArrow.svg" />
        </button>

        {/* Explicit API srcSet keeps the first paint light and the hover zoom sharp. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainSrc}
          srcSet={mainSrcSet}
          alt={currentImage?.altText || `product-image-${currentIndex}`}
          width={300}
          height={300}
          className={styles.mainImage}
          loading={currentIndex === 0 ? "eager" : "lazy"}
          fetchPriority={currentIndex === 0 ? "high" : "auto"}
          decoding="async"
          onLoad={() => {
            if (currentIndex === 0) setInitialImageLoaded(true);
          }}
          onMouseEnter={handleZoomStart}
          onMouseLeave={() => setZooming(false)}
        />

        <button
          className={`${styles.arrowBtn} ${styles.right}`}
          onClick={handleNext}
        >
          <img src="/icons/DiscountArrowLeft.svg" alt="DiscountArrowLeft.svg" />
        </button>

        <div ref={thumbnailsRef} className={styles.thumbnails}>
          {images.map((image, i) => (
            <button
              key={`${image.url}-${i}`}
              ref={(element) => {
                thumbnailRefs.current[i] = element;
              }}
              onClick={() => handleSelect(i)}
              className={`${styles.thumbBox} ${
                currentIndex === i ? styles.active : ""
              }`}
            >
              <Image
                src={img(image.url, 200)}
                alt={image.altText || `thumb-${i}`}
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
