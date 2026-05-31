"use client";

import { useEffect, useState } from "react";
import {
  getStorefrontBanners,
  getStorefrontHome,
  StorefrontBanner,
  StorefrontPromotionBanner,
} from "@/lib/api/storefront";
import Slider from "../slider/Slider";
import DiscountSlider from "../discountSlider/DiscountSlider";
import styles from "./HeroSlider.module.scss";

const HeroSlider = () => {
  const [heroBanners, setHeroBanners] = useState<StorefrontBanner[]>([]);
  const [promotionBanners, setPromotionBanners] = useState<
    StorefrontPromotionBanner[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getStorefrontHome(), getStorefrontBanners()])
      .then(([home, banners]) => {
        if (!isMounted) return;

        const homeHeroBanners = home.heroBanners ?? [];
        const homePromotionBanners = home.promotionBanners ?? [];

        if (homeHeroBanners.length > 0 || homePromotionBanners.length > 0) {
          setHeroBanners(homeHeroBanners);
          setPromotionBanners(homePromotionBanners);
          return;
        }

        const sortedBanners = [...banners].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
        );
        const fallbackHeroIndex = sortedBanners.findIndex(
          (banner) => !/promotion/i.test(`${banner.title} ${banner.subtitle}`)
        );
        const heroIndex = fallbackHeroIndex >= 0 ? fallbackHeroIndex : 0;
        const fallbackHeroBanner = sortedBanners[heroIndex];

        setHeroBanners(fallbackHeroBanner ? [fallbackHeroBanner] : []);
        setPromotionBanners(
          sortedBanners.filter((_, index) => index !== heroIndex)
        );
      })
      .catch(() => {
        if (!isMounted) return;

        setHeroBanners([]);
        setPromotionBanners([]);
      })
      .finally(() => {
        if (isMounted) setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoaded || (heroBanners.length === 0 && promotionBanners.length === 0)) {
    return null;
  }

  return (
    <div className={styles.hero}>
      <Slider banners={heroBanners} />
      <DiscountSlider banners={promotionBanners} />
    </div>
  );
};

export default HeroSlider;
