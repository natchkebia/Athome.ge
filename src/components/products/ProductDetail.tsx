"use client";

import { useState } from "react";
import styles from "./ProductDetail.module.scss";
import ProductGallery from "./ProductGallery";
import StockCheck from "./StockCheck";
import MonitorsSection from "../monitors/Monitors";

interface Spec {
  label: string;
  value: string;
}

export interface ProductDetailProps {
  product: {
    id: string;
    slug?: string;
    category?: string;
    brand: string;
    title: string;
    price: number;
    oldPrice?: number;
    images: string[];
    specs: Spec[];
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [showAll, setShowAll] = useState(false);

  // specs განვყოფთ სამ ბლოკად:
  const modelSpecs = product.specs.slice(0, 3);
  const processorSpecs = product.specs.slice(3, 10);
  const videoSpecs = product.specs.slice(10);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <ProductGallery images={product.images} />

        <div className={styles.textContainer}>
          <div>
            <img src="/icons/razer.svg" alt="razer.logo" />
            <h2 className={styles.title}>ყურსასმენი - {product.title}</h2>
            <div className={styles.meta}>
              <div className={styles.stockWrapper}>
                მარაგი ფილიალებში: <StockCheck productId={product.id} />
              </div>
              <p>
                პროდუქტის კოდი: <span>{product.id}</span>
              </p>
              <p>
                მწარმოებლის კოდი:<span> {product.id}</span>
              </p>
              <p>
                ბრენდი: <span>{product.brand}</span>
              </p>
              <p>მოდელი: {product.slug && <span>{product.slug}</span>}</p>
              <p>
                ტიპი: <span> {product.category}</span>
              </p>
            </div>
          </div>

          <div className={styles.priceWrapper}>
            <div className={styles.prices}>
              <div className={styles.priceContainer}>
                <span className={styles.newPrice}>
                  {product.price.toFixed(2)} ₾
                </span>
                {product.oldPrice && (
                  <span className={styles.oldPrice}>
                    {product.oldPrice.toFixed(2)} ₾
                  </span>
                )}
              </div>
              <button>ყიდვა</button>
            </div>

            <div className={styles.actions}>
              <button className={styles.buyBtn}>
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

      {/* --- სპეციფიკაციები */}
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
              <MonitorsSection />
    </div>
  );
}
