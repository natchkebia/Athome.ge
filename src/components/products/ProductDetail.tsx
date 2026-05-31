"use client";

import { useEffect, useState } from "react";
import styles from "./ProductDetail.module.scss";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import StockCheck from "./StockCheck";
import ProductSection from "../shared/ProductSection";
import {
  getStorefrontProductsByCategory,
  StorefrontProductDetail,
} from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  normalizeMediaUrl,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";

interface Spec {
  label: string;
  value: string;
}

export interface ProductDetailProps {
  product: StorefrontProductDetail;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [showAll, setShowAll] = useState(false);
  const { addToCart } = useCommerce();
  const [fallbackRelatedProducts, setFallbackRelatedProducts] = useState<
    StorefrontProductCard[]
  >([]);
  const images =
    product.images.length > 0
      ? [...product.images]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => normalizeMediaUrl(image.url))
      : ["/images/discountPc.png"];
  const specs: Spec[] =
    product.specifications.length > 0
      ? product.specifications
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((spec) => ({
            label: `${spec.name || spec.groupName || "მახასიათებელი"}:`,
            value: spec.value || "-",
          }))
      : [
          { label: "ბრენდი:", value: product.brand.name },
          { label: "მოდელი:", value: product.model || product.sku },
          { label: "კატეგორია:", value: product.category.name },
          ...(product.subCategory
            ? [{ label: "ტიპი:", value: product.subCategory.name }]
            : []),
          { label: "მარაგი:", value: product.stockStatus },
          {
            label: "რაოდენობა:",
            value: String(product.totalEffectiveQuantity),
          },
        ];
  const relatedProducts =
    product.relatedProducts.length > 0
      ? product.relatedProducts.map(mapStorefrontProductToCard)
      : fallbackRelatedProducts;
  const oldPrice =
    product.pricing.sellingPrice > product.pricing.effectivePrice
      ? product.pricing.sellingPrice
      : undefined;

  useEffect(() => {
    let isMounted = true;

    if (product.relatedProducts.length > 0) {
      setFallbackRelatedProducts([]);
      return;
    }

    getStorefrontProductsByCategory(product.category.slug, 8)
      .then((items) => {
        if (!isMounted) return;

        setFallbackRelatedProducts(
          items
            .filter((item) => item.slug !== product.slug)
            .map(mapStorefrontProductToCard)
        );
      })
      .catch(() => {
        if (isMounted) setFallbackRelatedProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [product.category.slug, product.relatedProducts.length, product.slug]);

  const modelSpecs = specs.slice(0, 3);
  const processorSpecs = specs.slice(3, 10);
  const videoSpecs = specs.slice(10);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <ProductGallery images={images} />

        <div className={styles.textContainer}>
          <div>
            <h2 className={styles.title}>{product.name}</h2>
            {product.shortDescription && (
              <p className={styles.shortDescription}>
                {product.shortDescription}
              </p>
            )}
            <div className={styles.meta}>
              <div className={styles.stockWrapper}>
                მარაგი ფილიალებში: <StockCheck productId={String(product.id)} />
              </div>
              <p>
                პროდუქტის კოდი: <span>{product.id}</span>
              </p>
              <p>
                მწარმოებლის კოდი:<span> {product.sku}</span>
              </p>
              <p>
                ბრენდი: <span>{product.brand.name}</span>
              </p>
              <p>მოდელი: {product.model && <span>{product.model}</span>}</p>
              <p>
                ტიპი: <span> {product.subCategory?.name || product.category.name}</span>
              </p>
            </div>
          </div>

          <div className={styles.priceWrapper}>
            <div className={styles.prices}>
              <div className={styles.priceContainer}>
                <span className={styles.newPrice}>
                  {product.pricing.effectivePrice.toFixed(2)} ₾
                </span>
                {oldPrice && (
                  <span className={styles.oldPrice}>
                    {oldPrice.toFixed(2)} ₾
                  </span>
                )}
              </div>
              <button onClick={() => addToCart(product.id)}>ყიდვა</button>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.buyBtn}
                onClick={() => addToCart(product.id)}
              >
                <img src="/icons/Cart.svg" alt="Cart.svg" />
                <span>დამატება</span>
              </button>
              <button className={styles.cartBtn}>
                <img src="/icons/Arrows.svg" alt="Arrows.svg" />
                <span>შედარება</span>
              </button>
            </div>

            <div className={styles.badges}>
              <img src="/icons/Tbc.svg" alt="Tbc.svg" />
              <img src="/icons/Bank_of_Georgia.svg" alt="Bank_of_Georgia.svg" />
              <img src="/icons/kredo.svg" alt="kredo.svg" />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.specsSectionWrapper}>
        <h4>დამატებითი მახასიათებლები</h4>
        <div className={styles.specsSection}>
          <table>
            <tbody>
              {/* მოდელი */}
              <tr>
                <th
                  colSpan={2}
                  className={`${styles.sectionTitle} ${styles.first}`}
                >
                  მოდელი
                </th>
              </tr>
              {modelSpecs.map((spec, i) => (
                <tr key={`model-${i}`}>
                  <th>{spec.label}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}

              {/* პროცესორი */}
              <tr>
                <th colSpan={2} className={styles.sectionTitle}>
                  პროცესორი
                </th>
              </tr>
              {processorSpecs.map((spec, i) => (
                <tr key={`cpu-${i}`}>
                  <th>{spec.label}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}

              {/* ვიდეო ადაპტერი (მხოლოდ showAll=true-ზე გამოჩნდება) */}
              {showAll && (
                <>
                  <tr>
                    <th colSpan={2} className={styles.sectionTitle}>
                      ვიდეო ადაპტერი
                    </th>
                  </tr>
                  {videoSpecs.map((spec, i) => (
                    <tr key={`gpu-${i}`}>
                      <th>{spec.label}</th>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>

          {/* ღილაკი მეტის/ნაკლების ჩვენებისთვის */}

          <button
            className={styles.toggleBtn}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "ნაკლები დეტალი " : "მეტი დეტალი "}
          </button>
        </div>
      </div>
      <ProductReviews productId={product.id} />
      {relatedProducts.length > 0 && (
        <ProductSection
          icon="/icons/Monitor.svg"
          title="მსგავსი პროდუქტები"
          products={relatedProducts}
        />
      )}
    </div>
  );
}
