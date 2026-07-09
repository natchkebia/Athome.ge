"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare } from "@/contexts/CompareContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { img } from "@/lib/media/img";
import styles from "./CompareBar.module.scss";

export default function CompareBar() {
  const { items, removeCompare, clearCompare } = useCompare();
  const pathname = usePathname();

  // ცარიელ სიაზე და თვითონ შედარების გვერდზე ბარი არ გვჭირდება.
  if (items.length === 0 || pathname === "/compare") return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.items}>
          {items.map((item) => (
            <div key={item.id} className={styles.chip}>
              <button
                className={styles.remove}
                onClick={() => removeCompare(item.id)}
                aria-label="წაშლა"
              >
                ×
              </button>
              <div className={styles.thumb}>
                <img
                  src={img(normalizeMediaUrl(item.image), 100)}
                  alt={item.title}
                />
              </div>
              <div className={styles.info}>
                <span className={styles.title}>{item.title}</span>
                {item.newPrice !== undefined && (
                  <span className={styles.price}>
                    {item.newPrice.toFixed(2)} ₾
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href="/compare" className={styles.compareBtn}>
            შედარება
          </Link>
          <button className={styles.clear} onClick={clearCompare}>
            ყველა პროდუქტის წაშლა
          </button>
        </div>
      </div>
    </div>
  );
}
