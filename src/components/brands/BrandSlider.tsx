"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./BrandSlider.module.scss";
import BrandCard from "./BrandCard";
import {
  getFeaturedStorefrontBrands,
  StorefrontBrand,
} from "@/lib/api/storefront";

const fallbackBrands = [
  { slug: "sony", name: "Sony", logoUrl: "/icons/sony.svg" },
  { slug: "lenovo", name: "Lenovo", logoUrl: "/icons/lenovo.svg" },
  { slug: "asus", name: "Asus", logoUrl: "/icons/asus.svg" },
  { slug: "apple", name: "Apple", logoUrl: "/icons/apple.svg" },
  { slug: "philips", name: "Philips", logoUrl: "/icons/philips.svg" },
  { slug: "tplink", name: "TP-Link", logoUrl: "/icons/tplink.svg" },
  { slug: "sony-2", name: "Sony", logoUrl: "/icons/sony.svg" },
  { slug: "lenovo-2", name: "Lenovo", logoUrl: "/icons/lenovo.svg" },
  { slug: "asus-2", name: "Asus", logoUrl: "/icons/asus.svg" },
];

function normalizeLogoUrl(logoUrl: string) {
  if (logoUrl.startsWith("/media/http")) {
    return logoUrl.replace("/media/", "");
  }

  return logoUrl;
}

export default function BrandSlider() {
  const [brands, setBrands] = useState<StorefrontBrand[]>([]);

  useEffect(() => {
    let isMounted = true;

    getFeaturedStorefrontBrands()
      .then((items) => {
        if (!isMounted) return;

        setBrands([...items].sort((a, b) => a.displayOrder - b.displayOrder));
      })
      .catch(() => {
        console.log("[storefront/brands/featured] fallback static brands");
        if (isMounted) setBrands([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const slides = useMemo(
    () =>
      brands.length > 0
        ? brands.map((brand) => ({
            slug: brand.slug,
            name: brand.name,
            logoUrl: normalizeLogoUrl(brand.logoUrl),
          }))
        : fallbackBrands,
    [brands]
  );
  const loopSlides = [...slides, ...slides];

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>ბრენდები</h2>

      <div className={styles.slider} aria-label="Featured brands">
        <div className={styles.track}>
          {loopSlides.map((brand, index) => (
            <div className={styles.slide} key={`${brand.slug}-${index}`}>
              <Link
                href={`/products/brand/${brand.slug}`}
                className={styles.slideLink}
              >
                <BrandCard image={brand.logoUrl} alt={brand.name} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
