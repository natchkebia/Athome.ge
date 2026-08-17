"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import styles from "./BrandSlider.module.scss";
import BrandCard from "./BrandCard";
import {
  getFeaturedStorefrontBrands,
  StorefrontBrand,
} from "@/lib/api/storefront";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

function normalizeLogoUrl(logoUrl: string) {
  if (logoUrl.startsWith("/media/http")) {
    return logoUrl.replace("/media/", "");
  }

  return logoUrl;
}

export default function BrandSlider() {
  const locale = useStorefrontLocale();
  const [brands, setBrands] = useState<StorefrontBrand[]>([]);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const autoplayRestartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    getFeaturedStorefrontBrands()
      .then((items) => {
        if (!isMounted) return;

        setBrands([...items].sort((a, b) => a.displayOrder - b.displayOrder));
      })
      .catch(() => {
        if (isMounted) setBrands([]);
      });

    return () => {
      isMounted = false;
      if (autoplayRestartRef.current) {
        clearTimeout(autoplayRestartRef.current);
      }
    };
  }, []);

  const slides = useMemo(
    () =>
      brands.map((brand) => ({
            slug: brand.slug,
            name: brand.name,
            logoUrl: normalizeLogoUrl(brand.logoUrl),
          })),
    [brands]
  );
  if (slides.length === 0) return null;

  const changeDirection = (reverse: boolean) => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;

    if (autoplayRestartRef.current) {
      clearTimeout(autoplayRestartRef.current);
    }

    // Continuous autoplay keeps a long CSS transition active. Freeze it at
    // its current visual position first so an arrow click is never ignored.
    const currentTranslate = swiper.getTranslate();
    swiper.autoplay.stop();
    swiper.wrapperEl.style.transitionDuration = "0ms";
    swiper.setTranslate(currentTranslate);
    swiper.updateProgress();
    swiper.animating = false;
    swiper.params.autoplay = {
      ...(typeof swiper.params.autoplay === "object" ? swiper.params.autoplay : {}),
      reverseDirection: reverse,
    };

    if (reverse) {
      swiper.slidePrev(450);
    } else {
      swiper.slideNext(450);
    }

    autoplayRestartRef.current = setTimeout(() => {
      if (!swiper.destroyed) swiper.autoplay.start();
    }, 500);
  };

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>{locale === "en" ? "Brands" : "ბრენდები"}</h2>

      <div className={styles.sliderShell}>
        <button
          className={`${styles.navigationButton} ${styles.previous}`}
          type="button"
          onClick={() => changeDirection(true)}
          aria-label={locale === "en" ? "Previous brands" : "წინა ბრენდები"}
        >
          <img src="/icons/DiscountArrow.svg" alt="" />
        </button>

        <Swiper
          className={styles.slider}
          aria-label="Featured brands"
          modules={[Autoplay]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          loop={slides.length > 6}
          speed={7000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            reverseDirection: false,
          }}
          slidesPerView={6}
          spaceBetween={24}
          breakpoints={{
            0: { slidesPerView: 1.35, spaceBetween: 12 },
            480: { slidesPerView: 2, spaceBetween: 12 },
            769: { slidesPerView: 4, spaceBetween: 16 },
            1181: { slidesPerView: 6, spaceBetween: 24 },
          }}
        >
          {slides.map((brand) => (
            <SwiperSlide className={styles.slide} key={brand.slug}>
              <Link
                href={`/products/brand/${brand.slug}`}
                className={styles.slideLink}
              >
                <BrandCard image={brand.logoUrl} alt={brand.name} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className={`${styles.navigationButton} ${styles.next}`}
          type="button"
          onClick={() => changeDirection(false)}
          aria-label={locale === "en" ? "Next brands" : "შემდეგი ბრენდები"}
        >
          <img src="/icons/DiscountArrowLeft.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
