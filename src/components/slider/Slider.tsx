"use client";

import { useState } from "react";
import styles from "./Slider.module.scss";

const sliderData = [
  {
    id: 1,
    image:
      "https://www.shutterstock.com/image-vector/upgrade-repair-desktop-computers-concept-260nw-2136088153.jpg",
  },
  {
    id: 2,
    image:
      "https://www.shutterstock.com/image-vector/hardware-software-computer-technology-background-600nw-2048513402.jpg",
  },
  {
    id: 3,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuI4zhMLj4akJu-U-97ql6hO4bnPC-nOEodjK9mum0u-RKpQfgsyjLcObeKoVn5R6aWN8&usqp=CAU",
  },
  {
    id: 4,
    image:
      "https://png.pngtree.com/thumb_back/fh260/background/20241001/pngtree-technology-and-digital-circuit-blue-computer-motherboard-abstract-hardware-science-background-image_16290499.jpg",
  },
  {
    id: 5,
    image:
      "https://cdn.shopify.com/s/files/1/0329/9865/3996/t/5/assets/computer_hardware_background_images_hd-bzSuBZ.True?v=1707743765",
  },
  {
    id: 6,
    image:
      "https://e0.pxfuel.com/wallpapers/690/225/desktop-wallpaper-electronic-chip-electronics-hardware-computer-hardware-keyboard-resized-computer-components.jpg",
  },
  {
    id: 7,
    image:
      "https://www.shutterstock.com/image-vector/upgrade-repair-desktop-computers-concept-260nw-2136088153.jpg",
  },
  {
    id: 8,
    image:
      "https://img.freepik.com/premium-photo/fragment-computer-hardware-components-inside-powerful-processor_407240-1421.jpg",
  },
  {
    id: 9,
    image:
      "https://www.shutterstock.com/image-vector/upgrade-repair-desktop-computers-concept-260nw-2136088153.jpg",
  },
];

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={styles.sliderContainer}
      style={{
        backgroundImage: `url(${sliderData[currentIndex].image})`,
      }}
    >
      <div className={styles.overlay}>
        <div className={styles.rightControls}>
          <div className={styles.range}>
            <span>{String(currentIndex + 1).padStart(2, "0")}</span>
            <div className={styles.line}>
              <div
                className={styles.progress}
                style={{
                  height: `${((currentIndex + 1) / sliderData.length) * 100}%`,
                }}
              />
            </div>
            <span> {String(sliderData.length).padStart(2, "0")}</span>
          </div>

          <div className={styles.controls}>
            <button onClick={handlePrev} className={styles.arrow}>
              <img src="./icons/Arrow-left.svg" alt="arrow-left" />
            </button>
            <button onClick={handleNext} className={styles.arrow}>
              <img src="./icons/Arrow-right.svg" alt="arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
