"use client";

import CategoryCard from "./CategoriCard";
import styles from "./Categori.module.scss";

const categories = [
  { title: "კომპიუტერი", image: "/images/pc.png", bgColor: "#F0F8F8" },
  { title: "ნოუთბუქი", image: "/images/laptop.png", bgColor: "#F8F2F8" },
  { title: "მონიტორი", image: "/images/monitor.png", bgColor: "#F9EEEE" },
  {
    title: "ქსელის აქსესუარი",
    image: "/images/network.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "მაგიდა და აქსესუარები",
    image: "/images/table.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "კომპიუტერის ნაწილები",
    image: "/images/drive.png",
    bgColor: "#F6F8FB",
  },
  {
    title: "მობილურის აქსესუარი",
    image: "/images/phone.png",
    bgColor: "#F6F8FB",
  },
  { title: "სერვისი", image: "/images/settings.png", bgColor: "#F7F7FC" },
];

export default function Categories() {
  return (
    <section className={styles.categoriesSection}>
      <div>
        <h2 className={styles.title}>კატეგორიები</h2>
        <div className={styles.grid}>
          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              title={cat.title}
              image={cat.image}
              bgColor={cat.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
