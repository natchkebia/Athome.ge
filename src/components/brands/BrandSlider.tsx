"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

  const loopSlides = [...slides, ...slides];

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>{locale === "en" ? "Brands" : "ბრენდები"}</h2>

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
