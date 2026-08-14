"use client";

import styles from "./Configurator.module.scss";
import { SelectedConfiguratorProduct } from "./configuratorTypes";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { printConfiguration } from "@/lib/configurator/printConfiguration";

type Props = {
  showPeripherals: boolean;
  selectedProducts: Record<string, SelectedConfiguratorProduct[] | undefined>;
  totalPrice: number;
  onSaveConfiguration: () => void;
  onAddToCart: () => void;
  saving?: boolean;
  addingToCart?: boolean;
  guestBuilds?: { token: string; name: string; expiresAt: string }[];
  onOpenGuestBuild?: (token: string) => void;
  onAddGuestBuildToCart?: (token: string) => void;
  onDeleteGuestBuild?: (token: string) => void;
};

export default function ConfiguratorSummary({
  showPeripherals,
  selectedProducts,
  totalPrice,
  onSaveConfiguration,
  onAddToCart,
  saving = false,
  addingToCart = false,
  guestBuilds = [],
  onOpenGuestBuild,
  onAddGuestBuildToCart,
  onDeleteGuestBuild,
}: Props) {
  const locale = useStorefrontLocale();
  const en = locale === "en";
  // ბოლოს არჩეული კომპონენტი ზემოთ ჩანს (newest first)
  const products = Object.values(selectedProducts)
    .flatMap((categoryProducts) => categoryProducts || [])
    .reverse();

  return (
    <div className={styles.summaryColumn}>
      <aside className={styles.summary}>
        <div className={styles.summaryImage}>
          <img
            src={showPeripherals
              ? "/images/configurator-peripherals.png"
              : "/images/case.svg"}
            alt={showPeripherals
              ? (en ? "Monitor and peripherals" : "მონიტორი და პერიფერია")
              : (en ? "PC case" : "კომპიუტერის კორპუსი")}
          />
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
            <div
              key={product.id}
              className={`${styles.selectedItem} ${product.stock <= 0 ? styles.selectedItemUnavailable : ""}`}
            >
              <span>
                {product.title} × {product.quantity}
                {product.stock <= 0 && (
                  <small>{en ? "Unavailable" : "მიუწვდომელია"}</small>
                )}
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
          <button
            type="button"
            onClick={() => void printConfiguration(selectedProducts, locale)}
            disabled={products.length === 0}
          >
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

      {guestBuilds.length > 0 && (
        <div className={styles.guestBuilds}>
          <h3>{en ? "Temporarily saved configurations" : "დროებით შენახული კონფიგურაციები"}</h3>
          {guestBuilds.map((build) => (
            <div key={build.token} className={styles.guestBuildRow}>
              <button type="button" className={styles.guestBuildOpen} onClick={() => onOpenGuestBuild?.(build.token)}>
                <span>{build.name}</span>
                <small>
                  {en ? "Available until" : "ხელმისაწვდომია"}: {new Date(build.expiresAt).toLocaleString(en ? "en-GB" : "ka-GE")}
                </small>
              </button>
              <div className={styles.guestBuildActions}>
                <button type="button" className={styles.guestBuildCart} onClick={() => onAddGuestBuildToCart?.(build.token)}>
                  {en ? "Add to cart" : "კალათაში დამატება"}
                </button>
                <button type="button" className={styles.guestBuildDelete} onClick={() => onDeleteGuestBuild?.(build.token)}>
                  {en ? "Delete" : "წაშლა"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
