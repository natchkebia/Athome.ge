"use client";

import { useEffect, useMemo, useState } from "react";
import CategoryCard from "./CategoriCard";
import styles from "./Categori.module.scss";
import {
  getStorefrontCategories,
  StorefrontCategory,
} from "@/lib/api/storefront";

const categories = [
  {
    title: "კომპიუტერი",
    slug: "computers",
    image: "/images/pc.png",
    bgColor: "#F0F8F8",
  },
  {
    title: "ნოუთბუქი",
    slug: "laptop",
    image: "/images/laptop.png",
    bgColor: "#F8F2F8",
  },
  {
    title: "მონიტორი",
    slug: "monitors-and-screens",
    image: "/images/monitor.png",
    bgColor: "#F9EEEE",
  },
  {
    title: "ქსელის აქსესუარი",
    slug: "networking-devices",
    image: "/images/network.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "მაგიდა და აქსესუარები",
    slug: "table",
    image: "/images/table.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "კომპიუტერის ნაწილები",
    slug: "computer-parts",
    image: "/images/drive.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "მობილურის აქსესუარი",
    slug: "mobile-accessories",
    image: "/images/phone.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "სერვისი",
    slug: "services",
    image: "/images/settings.png",
    bgColor: "#F7F7FC",
  },
];

const fallbackImagesBySlug: Record<string, string> = {
  computers: "/images/pc.png",
  laptop: "/images/laptop.png",
  "monitors-and-screens": "/images/monitor.png",
  peripherials: "/images/network.png",
  "computer-parts": "/images/drive.png",
  "gaming-accessories": "/images/table.png",
  "networking-devices": "/images/network.png",
  "storage-devices": "/images/drive.png",
  "power-and-electrical": "/images/settings.png",
};

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
  const [storefrontCategories, setStorefrontCategories] = useState<
    StorefrontCategory[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    getStorefrontCategories()
      .then((items) => {
        if (!isMounted) return;

        setStorefrontCategories(
          [...items].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8)
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
        ? storefrontCategories.map((category, index) => ({
            title: category.name,
            slug: category.slug,
            image:
              category.imageUrl ||
              fallbackImagesBySlug[category.slug] ||
              "/images/settings.png",
            bgColor: bgColors[index % bgColors.length],
          }))
        : categories,
    [storefrontCategories]
  );

  return (
    <section className={styles.categoriesSection}>
      <div>
        <h2 className={styles.title}>კატეგორიები</h2>
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
