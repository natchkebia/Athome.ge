"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./DiscountSlider.module.scss";
import DiscountCard from "./DiscountCard";
import { useCommerce } from "@/contexts/CommerceContext";

interface Product {
  id: number;
  discount?: number;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  isNew?: boolean;
  isWishlisted?: boolean;
  category?: string;
  slug?: string;
}

interface DiscountSliderProps {
  products: Product[];
  onToggleWishlist?: (id: number) => void;
  compact?: boolean;
  flush?: boolean;
  fixedCardSize?: boolean;
  deferOffscreenImages?: boolean;
}

export default function DiscountSlider({
  products,
  onToggleWishlist,
  compact = false,
  flush = false,
  fixedCardSize = false,
  deferOffscreenImages = false,
}: DiscountSliderProps) {
  const [progress, setProgress] = useState(10);
  const [isNearViewport, setIsNearViewport] = useState(!deferOffscreenImages);
  const [loadedThrough, setLoadedThrough] = useState(
    deferOffscreenImages ? -1 : Number.POSITIVE_INFINITY,
  );
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderId = useId().replace(/:/g, "");
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  useEffect(() => {
    if (!deferOffscreenImages) {
      setIsNearViewport(true);
      setLoadedThrough(Number.POSITIVE_INFINITY);
      return;
    }

    const slider = sliderRef.current;
    if (!slider) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsNearViewport(true);
        setLoadedThrough(5);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(slider);
    return () => observer.disconnect();
  }, [deferOffscreenImages]);

  const updateProgress = (swiper: {
    activeIndex: number;
    slides: unknown[];
    slidesPerViewDynamic: () => number;
  }) => {
    const visibleSlides = swiper.slidesPerViewDynamic();
    const total = swiper.slides.length - visibleSlides;
    const rawProgress = total > 0 ? (swiper.activeIndex / total) * 100 : 100;

    setProgress(swiper.activeIndex === 0 ? 10 : Math.min(rawProgress, 100));
    if (isNearViewport && deferOffscreenImages) {
      setLoadedThrough((current) =>
        Math.max(current, swiper.activeIndex + Math.ceil(visibleSlides) + 1),
      );
    }
  };

  return (
    <div
      ref={sliderRef}
      className={`${styles.sliderWrapper} ${
        compact ? styles.compactSlider : ""
      } ${flush ? styles.flushSlider : ""} ${
        fixedCardSize ? styles.fixedCardSlider : ""
      }`}
    >
      <div className={styles.topBar}>
        <div className={styles.rangeContainer}>
          <div className={styles.rangeTrack}>
            <div
              className={styles.rangeFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className={styles.navigation}>
          <div className={`discount-prev-${sliderId}`}>
            <img src="/icons/DiscountArrow.svg" alt="Arrow Left" />
          </div>
          <div className={`discount-next-${sliderId}`}>
            <img src="/icons/DiscountArrowLeft.svg" alt="Arrow Right" />
          </div>
        </div>
      </div>

      <div className={styles.swiperViewport}>
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: `.discount-next-${sliderId}`,
            prevEl: `.discount-prev-${sliderId}`,
          }}
          slidesPerView="auto"
          spaceBetween={24}
          breakpoints={{
            0: {
              spaceBetween: 12,
            },
            541: {
              spaceBetween: 12,
            },
            640: {
              spaceBetween: 16,
            },
            769: {
              spaceBetween: 16,
            },
            1024: {
              spaceBetween: 24,
            },
            1181: {
              spaceBetween: 24,
            },
          }}
          loop={false}
          onSlideChange={updateProgress}
          onAfterInit={updateProgress}
          className={styles.swiper}
        >
          {products.map((item, index) => (
            <SwiperSlide key={item.id}>
              {item.category && item.slug ? (
                <Link
                  href={`/products/${item.category}/${item.slug}`}
                  className={styles.cardLink}
                >
                  <DiscountCard
                    id={String(item.id)}
                    discount={item.discount}
                    image={item.image}
                    title={item.title}
                    oldPrice={item.oldPrice}
                    newPrice={item.newPrice}
                    isNew={item.isNew}
                    isWishlisted={
                      item.isWishlisted ?? wishlistProductIds.has(item.id)
                    }
                    onToggleWishlist={(id) =>
                      onToggleWishlist
                        ? onToggleWishlist(Number(id))
                        : toggleWishlist(Number(id))
                    }
                    onAddToCart={(id) => addToCart(Number(id))}
                    fixedSize={fixedCardSize}
                    eager={isNearViewport && index <= loadedThrough}
                    renderImage={!deferOffscreenImages || index <= loadedThrough}
                  />
                </Link>
              ) : (
                <DiscountCard
                  id={String(item.id)}
                  discount={item.discount}
                  image={item.image}
                  title={item.title}
                  oldPrice={item.oldPrice}
                  newPrice={item.newPrice}
                  isNew={item.isNew}
                  isWishlisted={
                    item.isWishlisted ?? wishlistProductIds.has(item.id)
                  }
                  onToggleWishlist={(id) =>
                    onToggleWishlist
                      ? onToggleWishlist(Number(id))
                      : toggleWishlist(Number(id))
                  }
                  onAddToCart={(id) => addToCart(Number(id))}
                  fixedSize={fixedCardSize}
                  eager={isNearViewport && index <= loadedThrough}
                  renderImage={!deferOffscreenImages || index <= loadedThrough}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
