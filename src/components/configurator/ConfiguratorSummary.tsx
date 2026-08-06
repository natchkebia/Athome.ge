"use client";

import styles from "./Configurator.module.scss";
import { SelectedConfiguratorProduct } from "./configuratorTypes";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

type Props = {
  selectedProducts: Record<string, SelectedConfiguratorProduct[] | undefined>;
  totalPrice: number;
  onSaveConfiguration: () => void;
  onAddToCart: () => void;
  saving?: boolean;
  addingToCart?: boolean;
};

export default function ConfiguratorSummary({
  selectedProducts,
  totalPrice,
  onSaveConfiguration,
  onAddToCart,
  saving = false,
  addingToCart = false,
}: Props) {
  const en = useStorefrontLocale() === "en";
  // ბოლოს არჩეული კომპონენტი ზემოთ ჩანს (newest first)
  const products = Object.values(selectedProducts)
    .flatMap((categoryProducts) => categoryProducts || [])
    .reverse();

  return (
    <div className={styles.summaryColumn}>
      <aside className={styles.summary}>
        <div className={styles.summaryImage}>
          <img src="/images/case.svg" alt="PC Case" />
        </div>

        <div className={styles.total}>
          <strong>{totalPrice} ₾</strong>
          <span>{en ? "Configuration total" : "კონფიგურაციის ჯამი"}</span>
        </div>
      </aside>

      <div className={styles.selectedList}>
        {products.length === 0 ? (
          <p>{en ? "No components selected yet" : "ჯერ არცერთი ნაწილი არ არის არჩეული"}</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className={styles.selectedItem}>
              <span>
                {product.title} × {product.quantity}
              </span>

              <strong>{product.price * product.quantity} ₾</strong>
            </div>
          ))
        )}
      </div>

      <div className={styles.summaryActions}>
        <div>
          <button type="button" onClick={onSaveConfiguration} disabled={saving}>
            <img src="/images/conf1.svg" alt="configurator" />
            <span>{saving ? (en ? "Saving..." : "ინახება...") : (en ? "Save configuration" : "კონფიგურაციის შენახვა")}</span>
          </button>
        </div>

        <div>
          <button type="button">
            <img src="/images/conf2.svg" alt="configurator" />
            <span>{en ? "Download configuration" : "კონფიგურაციის ჩამოტვირთვა"}</span>
          </button>
        </div>

        <div>
          <button type="button" onClick={onAddToCart} disabled={addingToCart}>
            <img src="/images/conf3.svg" alt="configurator" />
            <span>{addingToCart ? (en ? "Adding..." : "ემატება...") : (en ? "Add to cart" : "კალათაში დამატება")}</span>
          </button>
        </div>

        <div>
          <button type="button">
            <img src="/images/conf4.svg" alt="configurator" />
            <span>{en ? "Ready-made configurations" : "მზა კონფიგურაციები"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
