"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./DiscountSlider.module.scss";
import DiscountCard from "./DiscountCard";

interface Product {
  id: number;
  discount: number;
  image: string;
  title: string;
  oldPrice: number;
  newPrice: number;
  isNew?: boolean;
}

interface DiscountSliderProps {
  products: Product[];
}

export default function DiscountSlider({ products }: DiscountSliderProps) {
  const [progress, setProgress] = useState(10);

  return (
    <div className={styles.sliderWrapper}>
      {/* ზედა ნაწილი */}
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
          <div className="discount-prev">
            <img src="./icons/DiscountArrow.svg" alt="Arrow Left" />
          </div>
          <div className="discount-next">
            <img src="./icons/DiscountArrowLeft.svg" alt="Arrow Right" />
          </div>
        </div>
      </div>

      {/* სლაიდერი */}
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".discount-next",
          prevEl: ".discount-prev",
        }}
        slidesPerView={4}
        spaceBetween={24}
        loop={false}
        onSlideChange={(swiper) => {
          const slidesPerView = Number(swiper.params.slidesPerView) || 1;
          const total = swiper.slides.length - slidesPerView;

          const rawProgress =
            total > 0 ? (swiper.activeIndex / total) * 100 : 100;

          const progressValue =
            swiper.activeIndex === 0
              ? 10
              : rawProgress > 100
              ? 100
              : rawProgress;

          setProgress(progressValue);
        }}
        onAfterInit={(swiper) => {
          const slidesPerView = Number(swiper.params.slidesPerView) || 1;
          const total = swiper.slides.length - slidesPerView;
          const progressValue =
            total > 0 ? Math.max((swiper.activeIndex / total) * 100, 10) : 100;
          setProgress(progressValue);
        }}
        className={styles.swiper}
      >
        {products.map((item) => (
          <SwiperSlide key={item.id}>
            <DiscountCard
              discount={item.discount}
              image={item.image}
              title={item.title}
              oldPrice={item.oldPrice}
              newPrice={item.newPrice}
              isNew={item.isNew}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
