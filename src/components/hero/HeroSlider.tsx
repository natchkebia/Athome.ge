"use client";

import { useEffect, useState } from "react";
import {
  getStorefrontBanners,
  getStorefrontHome,
  StorefrontBanner,
  StorefrontHome,
  StorefrontPromotionBanner,
} from "@/lib/api/storefront";
import Slider from "../slider/Slider";
import DiscountSlider from "../discountSlider/DiscountSlider";
import styles from "./HeroSlider.module.scss";

type HeroSliderProps = {
  initialHome?: StorefrontHome;
  initialBanners?: StorefrontBanner[];
};

function computeBanners(home?: StorefrontHome, banners?: StorefrontBanner[]) {
  const homeHeroBanners = home?.heroBanners ?? [];
  const homePromotionBanners = home?.promotionBanners ?? [];

  if (homeHeroBanners.length > 0 || homePromotionBanners.length > 0) {
    let promoBanners: StorefrontPromotionBanner[] = [];
    if (homePromotionBanners.length > 0) {
      promoBanners = homePromotionBanners;
    } else if (banners && banners.length > 0) {
      const heroIds = new Set(homeHeroBanners.map((b) => b.id));
      promoBanners = banners.filter((b) => !heroIds.has(b.id));
    }
    return { heroBanners: homeHeroBanners, promotionBanners: promoBanners };
  }

  if (banners && banners.length > 0) {
    const sortedBanners = [...banners].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
    );
    const fallbackHeroIndex = sortedBanners.findIndex(
      (banner) => !/promotion/i.test(`${banner.title} ${banner.subtitle}`)
    );
    const heroIndex = fallbackHeroIndex >= 0 ? fallbackHeroIndex : 0;
    const fallbackHeroBanner = sortedBanners[heroIndex];

    return {
      heroBanners: fallbackHeroBanner ? [fallbackHeroBanner] : [],
      promotionBanners: sortedBanners.filter((_, index) => index !== heroIndex),
    };
  }

  return { heroBanners: [], promotionBanners: [] };
}

const HeroSlider = ({ initialHome, initialBanners }: HeroSliderProps) => {
  const initial = computeBanners(initialHome, initialBanners);
  const [heroBanners, setHeroBanners] = useState<StorefrontBanner[]>(
    initial.heroBanners
  );
  const [promotionBanners, setPromotionBanners] = useState<
    StorefrontPromotionBanner[]
  >(initial.promotionBanners);
  const [isLoaded, setIsLoaded] = useState(
    initial.heroBanners.length > 0 || initial.promotionBanners.length > 0
  );

  useEffect(() => {
    if (initialHome && initialBanners) return;

    let isMounted = true;

    Promise.all([getStorefrontHome(), getStorefrontBanners()])
      .then(([home, banners]) => {
        if (!isMounted) return;
        const res = computeBanners(home, banners);
        setHeroBanners(res.heroBanners);
        setPromotionBanners(res.promotionBanners);
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
  }, [initialHome, initialBanners]);

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

