"use client";

import { useState, useId } from "react";
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
}

export default function DiscountSlider({
  products,
  onToggleWishlist,
  compact = false,
}: DiscountSliderProps) {
  const [progress, setProgress] = useState(10);
  const sliderId = useId().replace(/:/g, "");
  const { wishlistProductIds, toggleWishlist, addToCart } = useCommerce();

  const updateProgress = (swiper: {
    activeIndex: number;
    slides: unknown[];
    slidesPerViewDynamic: () => number;
  }) => {
    const visibleSlides = swiper.slidesPerViewDynamic();
    const total = swiper.slides.length - visibleSlides;
    const rawProgress = total > 0 ? (swiper.activeIndex / total) * 100 : 100;

    setProgress(swiper.activeIndex === 0 ? 10 : Math.min(rawProgress, 100));
  };

  return (
    <div
      className={`${styles.sliderWrapper} ${
        compact ? styles.compactSlider : ""
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
          {products.map((item) => (
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
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
