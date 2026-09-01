"use client";

import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { useState } from "react";
import type { StorefrontBrandFilterSet } from "@/lib/api/storefront";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import styles from "./BrandCategoryFilter.module.scss";

export type BrandCategorySelection = { categorySlug?: string; subCategorySlug?: string };

function ProductCounts({ count, inStockCount, en }: { count: number; inStockCount: number; en: boolean }) {
  return <span className={styles.counts}><b>{count}</b><small>{en ? `${inStockCount} in stock` : `${inStockCount} მარაგში`}</small></span>;
}

export default function BrandCategoryFilter({ schema, value, onChange }: {
  schema: StorefrontBrandFilterSet;
  value: BrandCategorySelection;
  onChange: (value: BrandCategorySelection) => void;
}) {
  const en = useStorefrontLocale() === "en";
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return <aside className={styles.wrapper}>
    <div className={styles.header}>
      <h4>{en ? "Categories" : "კატეგორიები"}</h4>
      {(value.categorySlug || value.subCategorySlug) && <button onClick={() => onChange({})}>{en ? "Reset" : "გასუფთავება"}</button>}
    </div>
    <button className={`${styles.row} ${!value.categorySlug && !value.subCategorySlug ? styles.active : ""}`} onClick={() => onChange({})}>
      <span>{en ? "All products" : "ყველა პროდუქტი"}</span><ProductCounts count={schema.totalProductCount} inStockCount={schema.totalInStockCount} en={en} />
    </button>
    {schema.categories.map((category) => {
      const expanded = open[category.slug] ?? Boolean(value.categorySlug === category.slug || category.subCategories.some(s => s.slug === value.subCategorySlug));
      return <div key={category.slug} className={styles.group}>
        <div className={styles.categoryRow}>
          <button className={`${styles.row} ${value.categorySlug === category.slug ? styles.active : ""}`} onClick={() => onChange({ categorySlug: category.slug })}>
            <span>{category.name}</span><ProductCounts count={category.count} inStockCount={category.inStockCount} en={en} />
          </button>
          {category.subCategories.length > 0 && <button className={styles.toggle} aria-label={expanded ? "Collapse" : "Expand"} onClick={() => setOpen(current => ({ ...current, [category.slug]: !expanded }))}>{expanded ? <ChevronUp /> : <ChevronDown />}</button>}
        </div>
        {expanded && category.subCategories.map(sub => <button key={sub.slug} className={`${styles.subRow} ${value.subCategorySlug === sub.slug ? styles.active : ""}`} onClick={() => onChange({ subCategorySlug: sub.slug })}><span>{sub.name}</span><ProductCounts count={sub.count} inStockCount={sub.inStockCount} en={en} /></button>)}
      </div>;
    })}
  </aside>;
}
