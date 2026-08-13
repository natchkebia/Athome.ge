"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
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
  const sliderId = useId().replace(/:/g, "");
  const [brands, setBrands] = useState<StorefrontBrand[]>([]);

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

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>{locale === "en" ? "Brands" : "ბრენდები"}</h2>

      <div className={styles.sliderShell}>
        <button
          className={`${styles.navigationButton} ${styles.previous} brand-prev-${sliderId}`}
          type="button"
          aria-label={locale === "en" ? "Previous brands" : "წინა ბრენდები"}
        >
          <img src="/icons/DiscountArrow.svg" alt="" />
        </button>

        <Swiper
          className={styles.slider}
          aria-label="Featured brands"
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: `.brand-prev-${sliderId}`,
            nextEl: `.brand-next-${sliderId}`,
          }}
          loop={slides.length > 6}
          speed={7000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
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
          className={`${styles.navigationButton} ${styles.next} brand-next-${sliderId}`}
          type="button"
          aria-label={locale === "en" ? "Next brands" : "შემდეგი ბრენდები"}
        >
          <img src="/icons/DiscountArrowLeft.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
