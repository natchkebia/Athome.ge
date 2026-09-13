"use client";

import type { StorefrontDealCategory } from "@/lib/api/storefront";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import styles from "./DealsCategoryFilter.module.scss";

type Props = {
  categories: StorefrontDealCategory[];
  selectedSlugs: string[];
  loading?: boolean;
  onChange: (slugs: string[]) => void;
};

export default function DealsCategoryFilter({ categories, selectedSlugs, loading = false, onChange }: Props) {
  const en = useStorefrontLocale() === "en";
  const selected = new Set(selectedSlugs);
  const groups = [
    { level: "category" as const, title: en ? "Categories" : "კატეგორიები" },
    { level: "subCategory" as const, title: en ? "Subcategories" : "ქვეკატეგორიები" },
  ];

  const toggle = (slug: string) => {
    onChange(selected.has(slug) ? selectedSlugs.filter((item) => item !== slug) : [...selectedSlugs, slug]);
  };

  return (
    <section className={styles.wrapper} aria-label={en ? "Deal categories" : "ფასდაკლების კატეგორიები"}>
      <div className={styles.header}>
        <h2>{en ? "Filter" : "ფილტრი"}</h2>
        <button type="button" onClick={() => onChange([])} disabled={selectedSlugs.length === 0}>
          <img src="/icons/ArrowClockwise.svg" alt="" />
          {en ? "Reset" : "გასუფთავება"}
        </button>
      </div>

      {loading ? (
        <div className={styles.skeleton} aria-label={en ? "Loading categories" : "კატეგორიები იტვირთება"}>
          {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
        </div>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => {
            const items = categories.filter((category) => category.level === group.level).sort((left, right) => right.count - left.count);
            if (items.length === 0) return null;
            return (
              <div className={styles.group} key={group.level}>
                <h3>{group.title}</h3>
                <div className={styles.options}>
                  {items.map((category) => (
                    <label className={`${styles.option} ${group.level === "subCategory" ? styles.subcategory : ""}`} key={`${group.level}-${category.slug}`}>
                      <input type="checkbox" checked={selected.has(category.slug)} onChange={() => toggle(category.slug)} />
                      <span className={styles.checkbox} aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3.5 8 3 3 6-6" /></svg></span>
                      <span className={styles.name}>{category.name}</span>
                      <span className={styles.count}>{category.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
