"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import { useCompare } from "@/contexts/CompareContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { useToast } from "@/contexts/ToastContext";
import { cacheProductInfo } from "@/lib/commerce/guestStore";
import { flyToTarget } from "@/lib/ui/flyToCart";
import {
  getStorefrontProduct,
  searchStorefrontProducts,
  StorefrontProductDetail,
  StorefrontSearchProduct,
} from "@/lib/api/storefront";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { img } from "@/lib/media/img";
import styles from "./compare.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

// თითო პროდუქტისთვის ვაშენებთ "მახასიათებელი → მნიშვნელობა" სიას.
// საბაზისო ველები ყოველთვის გვაქვს, ამიტომ ცხრილი არასდროს რჩება ცარიელი —
// ზემოდან ემატება specifications/attributes, თუ პროდუქტს აქვს.
function buildSpecMap(detail: StorefrontProductDetail, en: boolean): Map<string, string> {
  const map = new Map<string, string>();

  const setIf = (label: string, value?: string) => {
    if (value && value.trim() && !map.has(label)) map.set(label, value);
  };

  setIf("SKU", detail.sku);
  setIf(en ? "Brand" : "ბრენდი", detail.brand?.name);
  setIf(en ? "Model" : "მოდელი", detail.model);

  // specifications ახლა ჯგუფებადაა: {name, fields:[{label,value}]}
  detail.specifications?.forEach((group) => {
    group.fields?.forEach((field) => {
      if (field.label) setIf(field.label, field.value);
    });
  });

  detail.attributes?.forEach((attr) => {
    if (attr.name) setIf(attr.name, attr.selectedValue);
  });

  return map;
}

export default function ComparePage() {
  const en = useStorefrontLocale() === "en";
  const { items, removeCompare, clearCompare, toggleCompare, isFull, maxItems } = useCompare();
  const { addToCart } = useCommerce();
  const { showToast } = useToast();

  const [details, setDetails] = useState<
    Record<number, StorefrontProductDetail>
  >({});
  const [loading, setLoading] = useState(false);
  const [showMobileStickyHeader, setShowMobileStickyHeader] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerProducts, setPickerProducts] = useState<StorefrontSearchProduct[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [addingPickerSlug, setAddingPickerSlug] = useState<string | null>(null);
  const productHeaderRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const updateStickyHeader = () => {
      if (!window.matchMedia("(max-width: 768px)").matches) {
        setShowMobileStickyHeader(false);
        return;
      }

      const header = productHeaderRef.current;
      setShowMobileStickyHeader(Boolean(header && header.getBoundingClientRect().bottom <= 0));
    };

    updateStickyHeader();
    window.addEventListener("scroll", updateStickyHeader, { passive: true });
    window.addEventListener("resize", updateStickyHeader);
    return () => {
      window.removeEventListener("scroll", updateStickyHeader);
      window.removeEventListener("resize", updateStickyHeader);
    };
  }, [items.length]);

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

  useEffect(() => {
    if (!pickerOpen || pickerQuery.trim().length < 2) {
      setPickerProducts([]);
      setPickerLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setPickerLoading(true);
      searchStorefrontProducts({ query: pickerQuery, page: 1, pageSize: 12 })
        .then((result) => {
          if (active) setPickerProducts(result.products);
        })
        .catch(() => {
          if (active) setPickerProducts([]);
        })
        .finally(() => {
          if (active) setPickerLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [pickerOpen, pickerQuery]);

  useEffect(() => {
    if (!pickerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pickerOpen]);

  const breadcrumbs = [
    { label: en ? "Home" : "მთავარი გვერდი", href: "/" },
    { label: en ? "Compare" : "შედარება" },
  ];

  // თითო პროდუქტის მახასიათებლების map.
  const specMaps: Record<number, Map<string, string>> = {};
  items.forEach((item) => {
    const detail = details[item.id];
    if (detail) specMaps[item.id] = buildSpecMap(detail, en);
  });

  // Figma-ს ცხრილის სტრუქტურა: ძირითადი ველები, შემდეგ backend-ის ჯგუფები
  // საკუთარი სათაურებით და ბოლოს ჯგუფს გარეთ დარჩენილი attributes.
  type SpecLayoutRow = { type: "group" | "spec"; label: string };
  const specLayout: SpecLayoutRow[] = [];
  const addedSpecs = new Set<string>();
  const addedGroups = new Set<string>();
  const addSpec = (label: string) => {
    if (!addedSpecs.has(label)) {
      addedSpecs.add(label);
      specLayout.push({ type: "spec", label });
    }
  };

  ["SKU", en ? "Brand" : "ბრენდი", en ? "Model" : "მოდელი"].forEach((label) => {
    if (items.some((item) => specMaps[item.id]?.has(label))) addSpec(label);
  });

  items.forEach((item) => {
    details[item.id]?.specifications?.forEach((group) => {
      if (group.name && !addedGroups.has(group.name)) {
        addedGroups.add(group.name);
        specLayout.push({ type: "group", label: group.name });
      }
      group.fields?.forEach((field) => {
        if (field.label) addSpec(field.label);
      });
    });
  });

  items.forEach((item) => {
    specMaps[item.id]?.forEach((_value, label) => addSpec(label));
  });

  const getSpecValue = (productId: number, label: string): string => {
    return specMaps[productId]?.get(label) || "—";
  };

  const handleAddToCart = async (
    productId: number,
    sourceEl?: HTMLElement | null,
    imageUrl?: string
  ) => {
    const item = items.find((entry) => entry.id === productId);
    const detail = details[productId];

    // Guest cart სრულ ჩანაწერს product-info cache-დან აგებს. შედარების გვერდიც
    // იმავე მონაცემებს წერს, რასაც პროდუქტის ბარათი და დეტალური გვერდი.
    if (item) {
      cacheProductInfo({
        productId,
        productName: detail?.name || item.title,
        imageUrl: imageUrl || normalizeMediaUrl(item.image),
        slug: detail?.slug || item.slug,
        sellingPrice:
          detail?.pricing.effectivePrice ?? item.newPrice ?? item.oldPrice ?? 0,
        oldPrice:
          detail &&
          detail.pricing.sellingPrice > detail.pricing.effectivePrice
            ? detail.pricing.sellingPrice
            : item.oldPrice,
        isInStock: detail?.isAvailable ?? true,
      });
    }

    if (sourceEl && imageUrl) flyToTarget(sourceEl, imageUrl, "cart");
    await addToCart(productId);
    showToast(en ? "Added to cart" : "კალათაში დაემატა");
  };

  const handleAddProduct = async (product: StorefrontSearchProduct) => {
    setAddingPickerSlug(product.slug);
    let detail: StorefrontProductDetail;
    try {
      detail = await getStorefrontProduct(product.slug);
    } catch {
      showToast(en ? "The product could not be added" : "პროდუქტის დამატება ვერ მოხერხდა", "error");
      setAddingPickerSlug(null);
      return;
    }

    const result = toggleCompare({
      id: detail.id,
      slug: detail.slug,
      category: detail.category.slug,
      title: detail.name,
      image: normalizeMediaUrl(detail.images.find((image) => image.isMain)?.url ?? detail.images[0]?.url ?? product.thumbnailUrl),
      newPrice: detail.pricing.effectivePrice,
      oldPrice: detail.pricing.sellingPrice > detail.pricing.effectivePrice ? detail.pricing.sellingPrice : undefined,
    });
    setAddingPickerSlug(null);

    if (result === "full") {
      showToast(en ? `You can compare up to ${maxItems} products` : `შედარებაში მაქსიმუმ ${maxItems} პროდუქტია`, "error");
      return;
    }

    if (result === "added") {
      showToast(en ? "Product added to comparison" : "პროდუქტი შედარებაში დაემატა");
      setPickerOpen(false);
      setPickerQuery("");
    }
  };

  const pickerDialog = pickerOpen ? <div className={styles.pickerOverlay} role="presentation" onMouseDown={() => setPickerOpen(false)}>
    <section className={styles.picker} role="dialog" aria-modal="true" aria-labelledby="compare-picker-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className={styles.pickerHead}>
        <h2 id="compare-picker-title">{en ? "Add a product" : "პროდუქტის დამატება"}</h2>
        <button type="button" onClick={() => setPickerOpen(false)} aria-label={en ? "Close" : "დახურვა"}>×</button>
      </div>
      <input autoFocus type="search" value={pickerQuery} onChange={(event) => setPickerQuery(event.target.value)} placeholder={en ? "Search by name or code" : "მოძებნე სახელით ან კოდით"} />
      <div className={styles.pickerResults}>
        {pickerLoading && <AtHomeLoader variant="inline" />}
        {!pickerLoading && pickerQuery.trim().length < 2 && <p>{en ? "Enter at least 2 characters" : "ჩაწერე მინიმუმ 2 სიმბოლო"}</p>}
        {!pickerLoading && pickerQuery.trim().length >= 2 && pickerProducts.length === 0 && <p>{en ? "No products found" : "პროდუქტი ვერ მოიძებნა"}</p>}
        {!pickerLoading && pickerProducts.map((product) => {
          const selected = items.some((item) => item.slug === product.slug);
          const adding = addingPickerSlug === product.slug;
          return <button type="button" key={product.slug} className={styles.pickerProduct} disabled={selected || adding} onClick={() => void handleAddProduct(product)}>
            <img src={img(normalizeMediaUrl(product.thumbnailUrl), 160)} alt="" />
            <span><strong>{product.name}</strong><small>{product.effectivePrice.toFixed(2)} ₾</small></span>
            <b className={selected ? styles.pickerSelected : undefined}>{selected ? (en ? "Added" : "დამატებულია") : adding ? "…" : "+"}</b>
          </button>;
        })}
      </div>
    </section>
  </div> : null;
  const pickerPortal = pickerDialog && typeof document !== "undefined"
    ? createPortal(pickerDialog, document.body)
    : null;

  if (items.length === 0) {
    return (
      <>
        <Breadcrumb items={breadcrumbs} />
        <div className={styles.container}>
          {pickerPortal}
          <div className={styles.empty}>
            <h2>{en ? "Your comparison list is empty" : "შესადარებელი სია ცარიელია"}</h2>
            <p>
              {en ? "Add products using the compare button " : "დაამატე პროდუქტები შედარების ღილაკით "}
              <img src="/icons/Arrows.svg" alt="compare" />
              {en ? " and compare them side by side." : " და ერთმანეთს გვერდიგვერდ შეადარე."}
            </p>
            <button type="button" className={styles.emptyBtn} onClick={() => setPickerOpen(true)}>
              {en ? "Add a product" : "პროდუქტის დამატება"}
            </button>
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
          <h1 className={styles.title}>{en ? "Product comparison" : "პროდუქტების შედარება"}</h1>
          <button className={styles.clearBtn} onClick={clearCompare}>
            {en ? "Clear list" : "სიის გასუფთავება"}
          </button>
        </div>

        {loading && <AtHomeLoader variant="inline" />}

        {pickerPortal}

        {showMobileStickyHeader && <div
          className={styles.mobileProductHeader}
          style={{ "--compare-columns": items.length } as CSSProperties}
        >
          {items.map((item) => (
            <div key={item.id} className={styles.mobileProductCard}>
              <button
                className={styles.mobileRemoveBtn}
                onClick={() => removeCompare(item.id)}
                aria-label={en ? "Remove" : "წაშლა"}
              >
                ×
              </button>
              {item.slug && item.category ? (
                <Link href={`/products/${item.category}/${item.slug}`}>
                  <img src={img(normalizeMediaUrl(item.image), 200)} alt={item.title} />
                  <span>{item.title}</span>
                </Link>
              ) : (
                <div>
                  <img src={img(normalizeMediaUrl(item.image), 200)} alt={item.title} />
                  <span>{item.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>}

        <div className={styles.tableScroll}>
          <table
            className={styles.table}
            style={{ "--compare-columns": items.length } as CSSProperties}
          >
            <tbody>
              {/* პროდუქტების header რიგი */}
              <tr ref={productHeaderRef} className={styles.productRow}>
                <th className={`${styles.rowLabel} ${styles.addProductCell}`}>
                  <button type="button" className={styles.addProductTile} disabled={isFull} onClick={() => setPickerOpen(true)}>
                    <span>+</span>
                    <small>{isFull ? (en ? "Comparison is full" : "შედარების სია შევსებულია") : (en ? "Add a product to compare" : "დაამატე პროდუქტი შესადარებლად")}</small>
                  </button>
                </th>
                {items.map((item) => (
                  <td key={item.id} className={styles.productCell}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeCompare(item.id)}
                      aria-label={en ? "Remove" : "წაშლა"}
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
                        <span className={styles.newPrice}>{item.newPrice.toFixed(2)} ₾</span>
                      )}
                      {item.oldPrice !== undefined && (
                        <span className={styles.oldPrice}>{item.oldPrice.toFixed(2)} ₾</span>
                      )}
                    </div>
                    <button
                      className={styles.addBtn}
                      onClick={(event) =>
                        handleAddToCart(item.id, event.currentTarget, normalizeMediaUrl(item.image))
                      }
                    >
                      <img src="/icons/CartWhite.svg" alt="" />
                      {en ? "Add to cart" : "დამატება"}
                    </button>
                  </td>
                ))}
              </tr>

              <tr className={styles.mobilePriceRow}>
                <th className={styles.rowLabel}>{en ? "Price" : "ფასი"}</th>
                {items.map((item) => (
                  <td key={item.id} className={styles.specCell}>
                    <div className={styles.mobilePriceBox}>
                      {item.newPrice !== undefined && (
                        <span className={styles.newPrice}>{item.newPrice.toFixed(2)} ₾</span>
                      )}
                      {item.oldPrice !== undefined && (
                        <span className={styles.oldPrice}>{item.oldPrice.toFixed(2)} ₾</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* მახასიათებლების რიგები — განსხვავებული მნიშვნელობები გამოიყოფა */}
              {specLayout.map((row) => {
                if (row.type === "group") {
                  return <tr key={`group-${row.label}`} className={styles.sectionRow}>
                    <th colSpan={items.length + 1}>{row.label}</th>
                  </tr>;
                }

                const label = row.label;
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

              {!loading && specLayout.length === 0 && (
                <tr>
                  <td
                    className={styles.noSpecs}
                    colSpan={items.length + 1}
                  >
                    {en ? "No specifications were found for these products." : "ამ პროდუქტებისთვის მახასიათებლები არ მოიძებნა."}
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
