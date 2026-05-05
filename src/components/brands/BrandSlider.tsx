"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./BrandSlider.module.scss";
import BrandCard from "./BrandCard";

export default function BrandSlider() {
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

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>ბრენდები</h2>

      <Swiper
        spaceBetween={24}
        slidesPerView="auto"
        breakpoints={{
          0: {
            spaceBetween: 12,
          },
          768: {
            spaceBetween: 18,
          },
          1200: {
            spaceBetween: 24,
          },
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
