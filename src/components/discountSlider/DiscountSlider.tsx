"use client";

import { useState } from "react";
import styles from "./DiscountSlider.module.scss";

const discountProducts = [
  {
    id: 1,
    image: "https://imgstore.alta.ge/images/400/116/116630_110_1.webp",
    oldPrice: 9500,
    newPrice: 7500,
  },
  {
    id: 2,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw3Ya7iTtyJ7AcneXQa6VymQ6hB6h6vULcKtvsoV69hecvK5WBzZO752VLXAWDdHPFuwI&usqp=CAU",
    oldPrice: 8200,
    newPrice: 6990,
  },
  {
    id: 3,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRylp0H1d0tM0Au_cOHsyl-pt0yOcDl8mq0h4BiFIhBQpQDDkiW_8NQ_1eKn_yP7Myqopk&usqp=CAU",
    oldPrice: 10500,
    newPrice: 8990,
  },
];

export default function DiscountSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? discountProducts.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === discountProducts.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={styles.sliderContainer}>
      <h3 className={styles.title}>საუკეთესო ფასდაკლებები</h3>

      <div className={styles.sliderContent}>
        <button
          onClick={handlePrev}
          className={`${styles.arrow} ${styles.left}`}
        >
          &#10094;
        </button>

        <div className={styles.productCard}>
          <img
            src={discountProducts[currentIndex].image}
            alt="product"
            className={styles.productImage}
          />

          <div className={styles.priceBox}>
            <span className={styles.newPrice}>
              {discountProducts[currentIndex].newPrice.toFixed(2)} ₾
            </span>
            <span className={styles.oldPrice}>
              {discountProducts[currentIndex].oldPrice.toFixed(2)} ₾
            </span>
          </div>
        </div>

        <button
          onClick={handleNext}
          className={`${styles.arrow} ${styles.right}`}
        >
          &#10095;
        </button>
      </div>

      <div className={styles.dots}>
        {discountProducts.map((_, index) => (
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
