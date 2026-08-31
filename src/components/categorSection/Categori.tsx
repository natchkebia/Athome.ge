"use client";

import { useEffect, useMemo, useState } from "react";
import CategoryCard from "./CategoriCard";
import styles from "./Categori.module.scss";
import {
  getStorefrontCategories,
  StorefrontCategory,
} from "@/lib/api/storefront";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

const bgColors = [
  "#F0F8F8",
  "#F8F2F8",
  "#F9EEEE",
  "#F6F8FB",
  "#F6F8FB",
  "#F6F8FB",
  "#F6F8FB",
  "#F7F7FC",
];

export default function Categories() {
  const locale = useStorefrontLocale();
  const [storefrontCategories, setStorefrontCategories] = useState<
    StorefrontCategory[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    // მხოლოდ მთავარი (top-level) კატეგორიების ნეიმები, როგორც backend აბრუნებს
    // (subCategories-ს თავს ვანებებთ; ცარიელი კატეგორია ბექის საქმეა).
    getStorefrontCategories()
      .then((items) => {
        if (!isMounted) return;

        setStorefrontCategories(
          [...items]
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      })
      .catch(() => {
        if (isMounted) setStorefrontCategories([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleCategories = useMemo(
    () =>
      storefrontCategories.length > 0
        ? storefrontCategories
            .map((category, index) => ({
              title: category.name,
              slug: category.slug,
              image: normalizeMediaUrl(category.imageUrl, ""),
              bgColor: bgColors[index % bgColors.length],
            }))
        : [],
    [storefrontCategories]
  );

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <section className={styles.categoriesSection}>
      <div>
        <h2 className={styles.title}>{locale === "en" ? "Categories" : "კატეგორიები"}</h2>
        <div className={styles.grid}>
          {visibleCategories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              title={cat.title}
              image={cat.image}
              bgColor={cat.bgColor}
              slug={cat.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
