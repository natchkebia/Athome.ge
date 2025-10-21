"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./BrandSlider.module.scss";
import BrandCard from "./BrandCard";

export default function BrandSlider() {
  const prevRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);

  const brands = [
    { id: 1, image: "/icons/sony.svg" },
    { id: 2, image: "/icons/lenovo.svg" },
    { id: 3, image: "/icons/asus.svg" },
    { id: 4, image: "/icons/apple.svg" },
    { id: 5, image: "/icons/philips.svg" },
    { id: 6, image: "/icons/tplink.svg" },
    { id: 7, image: "/icons/sony.svg" },
    { id: 8, image: "/icons/lenovo.svg" },
    { id: 9, image: "/icons/asus.svg" },
  ];

  const slidesPerView = 6;
  const canLoop = brands.length > slidesPerView; 

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>ბრენდები</h2>
      <div ref={prevRef} className={`${styles.navButton} ${styles.prev}`}>
        <img src="/icons/DiscountArrow.svg" alt="next" />
      </div>
      <div ref={nextRef} className={`${styles.navButton} ${styles.next}`}>
        <img src="/icons/DiscountArrowLeft.svg" alt="prev" />
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={slidesPerView}
        loop={canLoop}
        onBeforeInit={(swiper) => {
          // @ts-ignore 
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onInit={(swiper) => {
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        className={styles.slider}
      >
        {brands.map((brand) => (
          <SwiperSlide key={brand.id}>
            <BrandCard image={brand.image} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
