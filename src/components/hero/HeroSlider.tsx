import React from "react";
import Slider from "../slider/Slider";
import DiscountSlider from "../discountSlider/DiscountSlider";
import styles from './HeroSlider.module.scss'

const HeroSlider = () => {
  return (
    <div className={styles.hero}>
      <Slider />
      <DiscountSlider />
    </div>
  );
};

export default HeroSlider;
