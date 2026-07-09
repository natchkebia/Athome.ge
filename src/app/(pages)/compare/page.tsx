"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { useCompare } from "@/contexts/CompareContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { useToast } from "@/contexts/ToastContext";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import { flyToTarget } from "@/lib/ui/flyToCart";
import {
  getStorefrontProduct,
  StorefrontProductDetail,
} from "@/lib/api/storefront";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { img } from "@/lib/media/img";
import styles from "./compare.module.scss";

function specLabel(spec: {
  name?: string;
  groupName?: string;
}): string | null {
  return spec.name || spec.groupName || null;
}

// თითო პროდუქტისთვის ვაშენებთ "მახასიათებელი → მნიშვნელობა" სიას.
// საბაზისო ველები ყოველთვის გვაქვს, ამიტომ ცხრილი არასდროს რჩება ცარიელი —
// ზემოდან ემატება specifications/attributes, თუ პროდუქტს აქვს.
function buildSpecMap(detail: StorefrontProductDetail): Map<string, string> {
  const map = new Map<string, string>();

  const setIf = (label: string, value?: string) => {
    if (value && value.trim() && !map.has(label)) map.set(label, value);
  };

  setIf("SKU", detail.sku);
  setIf("ბრენდი", detail.brand?.name);
  setIf("მოდელი", detail.model);
  setIf("კატეგორია", detail.category?.name);
  setIf("ტიპი", detail.subCategory?.name);
  setIf("მარაგი", detail.stockStatus);

  detail.specifications?.forEach((spec) => {
    const label = specLabel(spec);
    if (label) setIf(label, spec.value);
  });

  detail.attributes?.forEach((attr) => {
    const label = attr.name || attr.groupName;
    if (label) setIf(label, attr.value);
  });

  return map;
}

export default function ComparePage() {
  const { items, removeCompare, clearCompare } = useCompare();
  const { addToCart } = useCommerce();
  const { showToast } = useToast();

  const [details, setDetails] = useState<
    Record<number, StorefrontProductDetail>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (items.length === 0) {
      setDetails({});
      return;
    }

    setLoading(true);

    Promise.all(
      items.map((item) =>
        item.slug
          ? getStorefrontProduct(item.slug)
              .then((detail) => ({ id: item.id, detail }))
              .catch(() => null)
          : Promise.resolve(null)
      )
    )
      .then((results) => {
        if (!active) return;

        const map: Record<number, StorefrontProductDetail> = {};
        results.forEach((result) => {
          if (result) map[result.id] = result.detail;
        });
        setDetails(map);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [items]);

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "შედარება" },
  ];

  // თითო პროდუქტის მახასიათებლების map.
  const specMaps: Record<number, Map<string, string>> = {};
  items.forEach((item) => {
    const detail = details[item.id];
    if (detail) specMaps[item.id] = buildSpecMap(detail);
  });

  // ყველა პროდუქტის მახასიათებლების გაერთიანებული სია (თანმიმდევრობის შენარჩუნებით).
  const specRows: string[] = [];
  items.forEach((item) => {
    specMaps[item.id]?.forEach((_value, label) => {
      if (!specRows.includes(label)) specRows.push(label);
    });
  });

  const getSpecValue = (productId: number, label: string): string => {
    return specMaps[productId]?.get(label) || "—";
  };

  const handleAddToCart = async (
    productId: number,
    sourceEl?: HTMLElement | null,
    imageUrl?: string
  ) => {
    const wasLoggedIn = Boolean(getStoredAuthTokens()?.accessToken);
    if (sourceEl && imageUrl) flyToTarget(sourceEl, imageUrl, "cart");
    await addToCart(productId);
    if (wasLoggedIn) showToast("კალათაში დაემატა");
  };

  if (items.length === 0) {
    return (
      <>
        <Breadcrumb items={breadcrumbs} />
        <div className={styles.container}>
          <div className={styles.empty}>
            <h2>შესადარებელი სია ცარიელია</h2>
            <p>
              დაამატე პროდუქტები შედარების ღილაკით{" "}
              <img src="/icons/Arrows.svg" alt="compare" /> და ერთმანეთს
              გვერდიგვერდ შეადარე.
            </p>
            <Link href="/" className={styles.emptyBtn}>
              მთავარ გვერდზე დაბრუნება
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={styles.container}>
        <div className={styles.head}>
          <h1 className={styles.title}>პროდუქტების შედარება</h1>
          <button className={styles.clearBtn} onClick={clearCompare}>
            სიის გასუფთავება
          </button>
        </div>

        {loading && <AtHomeLoader variant="inline" />}

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <tbody>
              {/* პროდუქტების header რიგი */}
              <tr className={styles.productRow}>
                <th className={styles.rowLabel} />
                {items.map((item) => (
                  <td key={item.id} className={styles.productCell}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeCompare(item.id)}
                      aria-label="წაშლა"
                    >
                      ×
                    </button>
                    {item.slug && item.category ? (
                      <Link
                        href={`/products/${item.category}/${item.slug}`}
                        className={styles.productLink}
                      >
                        <div className={styles.imageBox}>
                          <img
                            src={img(normalizeMediaUrl(item.image), 200)}
                            alt={item.title}
                          />
                        </div>
                        <span className={styles.productTitle}>
                          {item.title}
                        </span>
                      </Link>
                    ) : (
                      <div className={styles.productLink}>
                        <div className={styles.imageBox}>
                          <img
                            src={img(normalizeMediaUrl(item.image), 200)}
                            alt={item.title}
                          />
                        </div>
                        <span className={styles.productTitle}>
                          {item.title}
                        </span>
                      </div>
                    )}
                    <div className={styles.priceBox}>
                      {item.newPrice !== undefined && (
                        <span className={styles.newPrice}>
                          {item.newPrice.toFixed(2)} ₾
                        </span>
                      )}
                      {item.oldPrice !== undefined && (
                        <span className={styles.oldPrice}>
                          {item.oldPrice.toFixed(2)} ₾
                        </span>
                      )}
                    </div>
                    <button
                      className={styles.addBtn}
                      onClick={(e) =>
                        handleAddToCart(
                          item.id,
                          e.currentTarget,
                          normalizeMediaUrl(item.image)
                        )
                      }
                    >
                      <img src="/icons/CartWhite.svg" alt="cart" />
                      დამატება
                    </button>
                  </td>
                ))}
              </tr>

              {/* მახასიათებლების რიგები — განსხვავებული მნიშვნელობები გამოიყოფა */}
              {specRows.map((label) => {
                const values = items.map((item) =>
                  getSpecValue(item.id, label)
                );
                const differs =
                  items.length > 1 &&
                  values.some((value) => value !== values[0]);

                return (
                  <tr
                    key={label}
                    className={differs ? styles.diffRow : undefined}
                  >
                    <th className={styles.rowLabel}>{label}</th>
                    {values.map((value, index) => (
                      <td key={items[index].id} className={styles.specCell}>
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {!loading && specRows.length === 0 && (
                <tr>
                  <td
                    className={styles.noSpecs}
                    colSpan={items.length + 1}
                  >
                    ამ პროდუქტებისთვის მახასიათებლები არ მოიძებნა.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
