"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { getAllStorefrontBrands, StorefrontBrand } from "@/lib/api/storefront";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import styles from "./brands.module.scss";
import { normalizeMediaUrl } from "@/lib/storefront/products";

export default function BrandsPage() {
  const en = useStorefrontLocale() === "en"; const [brands, setBrands] = useState<StorefrontBrand[]>([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const items = await getAllStorefrontBrands({ sortBy: "name" });
        if (active) setBrands(items);
      } catch {
        if (active) setBrands([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);
  const visible = useMemo(() => brands.filter(brand => brand.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [brands, search]);
  return <><Breadcrumb items={[{ label: en ? "Home" : "მთავარი გვერდი", href: "/" }, { label: en ? "Brands" : "ბრენდები" }]} /><main className={`${styles.page} site-wrapper`}><div className={styles.heading}><div><h1>{en ? "Brands" : "ბრენდები"}</h1><p>{en ? `${brands.length} brands` : `${brands.length} ბრენდი`}</p></div><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={en ? "Search brands" : "ბრენდის ძიება"} /></div>{loading ? <AtHomeLoader variant="page" /> : <div className={styles.grid}>{visible.map(brand => <Link href={`/products/brand/${brand.slug}`} key={brand.slug} className={styles.card}>{brand.isFeatured && <span className={styles.featured}>{en ? "Featured" : "რჩეული"}</span>}<div className={styles.logo}>{brand.logoUrl ? <img src={normalizeMediaUrl(brand.logoUrl)} alt={brand.name} /> : <strong>{brand.name.slice(0, 2)}</strong>}</div><h2>{brand.name}</h2><p>{en ? `${brand.productCount} products` : `${brand.productCount} პროდუქტი`}</p></Link>)}</div>}{!loading && visible.length === 0 && <p className={styles.empty}>{en ? "No brands found" : "ბრენდი ვერ მოიძებნა"}</p>}</main></>;
}
